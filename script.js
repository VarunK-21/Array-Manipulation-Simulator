// Code Breaker Game - Main JavaScript
class CodeBreakerGame {
    constructor() {
        this.array = new Array(8).fill(null);
        this.targetPattern = [];
        this.currentLevel = 1;
        this.score = 0;
        this.operationsUsed = 0;
        this.timeLeft = 300;
        this.gameActive = true;
        this.timer = null;
        this.searchAnimation = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.generateTargetPattern();
        this.renderArray();
        this.updateUI();
        this.startTimer();
        this.showFeedback("⚡", "System initialized. Ready to hack the vault...", "normal");
    }

    setupEventListeners() {
        // Insert operation
        document.getElementById('insert-btn').addEventListener('click', () => this.insertOperation());
        document.getElementById('insert-value').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.insertOperation();
        });

        // Delete operation
        document.getElementById('delete-btn').addEventListener('click', () => this.deleteOperation());
        document.getElementById('delete-index').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.deleteOperation();
        });

        // Search operation
        document.getElementById('search-btn').addEventListener('click', () => this.searchOperation());
        document.getElementById('search-pattern').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchOperation();
        });

        // Reset and navigation
        document.getElementById('reset-btn').addEventListener('click', () => this.resetArray());
        document.getElementById('next-level-btn').addEventListener('click', () => this.nextLevel());
        document.getElementById('continue-btn').addEventListener('click', () => this.nextLevel());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
    }

    generateTargetPattern() {
        const patternLength = Math.min(2 + this.currentLevel, 4);
        this.targetPattern = [];
        
        for (let i = 0; i < patternLength; i++) {
            this.targetPattern.push(Math.floor(Math.random() * 10));
        }
        
        this.updateTargetDisplay();
    }

    updateTargetDisplay() {
        const display = document.getElementById('target-pattern');
        display.textContent = `[${this.targetPattern.join(', ')}]`;
    }

    renderArray() {
        const container = document.getElementById('array-display');
        container.innerHTML = '';
        
        this.array.forEach((value, index) => {
            const cell = document.createElement('div');
            cell.className = 'array-cell';
            cell.dataset.index = index;
            
            if (value !== null) {
                cell.textContent = value;
                cell.classList.add('filled');
            } else {
                cell.textContent = '';
                cell.classList.add('empty');
            }
            
            container.appendChild(cell);
        });
    }

    insertOperation() {
        if (!this.gameActive) return;
        
        const index = parseInt(document.getElementById('insert-index').value);
        const value = parseInt(document.getElementById('insert-value').value);
        
        // Validation
        if (isNaN(index) || isNaN(value)) {
            this.showFeedback("⚠️", "Invalid input! Enter valid numbers.", "error");
            this.playSound('error');
            return;
        }
        
        if (index < 0 || index >= this.array.length) {
            this.showFeedback("⚠️", "Index out of bounds! Use 0-7.", "error");
            this.playSound('error');
            return;
        }
        
        if (value < 0 || value > 9) {
            this.showFeedback("⚠️", "Value must be between 0-9!", "error");
            this.playSound('error');
            return;
        }

        // Perform insertion with animation
        this.animateInsertion(index, value);
        this.operationsUsed++;
        this.updateScore();
        
        this.showFeedback("✅", `Inserted ${value} at index ${index}!`, "success");
        this.playSound('insert');
        
        // Clear inputs
        document.getElementById('insert-index').value = '';
        document.getElementById('insert-value').value = '';
    }

    animateInsertion(index, value) {
        const cells = document.querySelectorAll('.array-cell');
        
        // Shift elements to the right
        for (let i = this.array.length - 1; i > index; i--) {
            if (this.array[i - 1] !== null) {
                this.array[i] = this.array[i - 1];
                this.array[i - 1] = null;
            }
        }
        
        // Insert new value
        this.array[index] = value;
        
        // Animate the shift
        cells.forEach((cell, i) => {
            if (i > index && this.array[i] !== null) {
                cell.style.transform = 'translateX(70px)';
                cell.style.transition = 'transform 0.3s ease';
                
                setTimeout(() => {
                    cell.style.transform = 'translateX(0)';
                    cell.textContent = this.array[i];
                    cell.className = 'array-cell filled';
                }, 300);
            }
        });
        
        // Animate new cell appearance
        setTimeout(() => {
            const newCell = cells[index];
            newCell.style.transform = 'scale(0)';
            newCell.style.transition = 'transform 0.3s ease';
            newCell.textContent = value;
            newCell.className = 'array-cell filled';
            
            setTimeout(() => {
                newCell.style.transform = 'scale(1)';
            }, 50);
        }, 300);
        
        setTimeout(() => {
            this.renderArray();
            this.checkWinCondition();
        }, 600);
    }

    deleteOperation() {
        if (!this.gameActive) return;
        
        const index = parseInt(document.getElementById('delete-index').value);
        
        if (isNaN(index)) {
            this.showFeedback("⚠️", "Invalid input! Enter a valid index.", "error");
            this.playSound('error');
            return;
        }
        
        if (index < 0 || index >= this.array.length) {
            this.showFeedback("⚠️", "Index out of bounds! Use 0-7.", "error");
            this.playSound('error');
            return;
        }
        
        if (this.array[index] === null) {
            this.showFeedback("⚠️", "No element at this index!", "error");
            this.playSound('error');
            return;
        }

        // Perform deletion with animation
        this.animateDeletion(index);
        this.operationsUsed++;
        this.updateScore();
        
        this.showFeedback("🗑️", `Deleted element at index ${index}.`, "success");
        this.playSound('delete');
        
        // Clear input
        document.getElementById('delete-index').value = '';
    }

    animateDeletion(index) {
        const cells = document.querySelectorAll('.array-cell');
        const deletedCell = cells[index];
        
        // Animate deletion
        deletedCell.style.transform = 'scale(0)';
        deletedCell.style.transition = 'transform 0.3s ease';
        
        setTimeout(() => {
            // Shift elements to the left
            for (let i = index; i < this.array.length - 1; i++) {
                this.array[i] = this.array[i + 1];
            }
            this.array[this.array.length - 1] = null;
            
            // Animate the shift
            cells.forEach((cell, i) => {
                if (i > index && i < this.array.length) {
                    cell.style.transform = 'translateX(-70px)';
                    cell.style.transition = 'transform 0.3s ease';
                    
                    setTimeout(() => {
                        cell.style.transform = 'translateX(0)';
                        cell.textContent = this.array[i] || '';
                        cell.className = this.array[i] !== null ? 'array-cell filled' : 'array-cell empty';
                    }, 300);
                }
            });
            
            setTimeout(() => {
                this.renderArray();
            }, 600);
        }, 300);
    }

    searchOperation() {
        if (!this.gameActive) return;
        
        const patternInput = document.getElementById('search-pattern').value.trim();
        
        if (!patternInput) {
            this.showFeedback("⚠️", "Enter a pattern to search! (e.g., 2,1,4)", "error");
            this.playSound('error');
            return;
        }
        
        const pattern = patternInput.split(',').map(x => parseInt(x.trim()));
        
        if (pattern.some(x => isNaN(x) || x < 0 || x > 9)) {
            this.showFeedback("⚠️", "Invalid pattern! Use numbers 0-9 separated by commas.", "error");
            this.playSound('error');
            return;
        }

        this.operationsUsed++;
        this.updateScore();
        
        // Perform search with animation
        this.animateSearch(pattern);
        
        // Clear input
        document.getElementById('search-pattern').value = '';
    }

    animateSearch(pattern) {
        const cells = document.querySelectorAll('.array-cell');
        const arrayValues = this.array.filter(x => x !== null);
        
        this.showFeedback("🔍", `Searching for pattern [${pattern.join(', ')}]...`, "normal");
        this.playSound('search');
        
        // Clear previous highlights
        cells.forEach(cell => cell.classList.remove('highlight'));
        
        let found = false;
        let searchIndex = 0;
        
        const searchStep = () => {
            if (searchIndex >= arrayValues.length - pattern.length + 1) {
                // Search complete
                if (!found) {
                    this.showFeedback("❌", `Pattern [${pattern.join(', ')}] not found!`, "error");
                    this.playSound('error');
                }
                return;
            }
            
            // Highlight current search position
            const startIndex = this.getActualIndex(searchIndex);
            for (let i = 0; i < pattern.length; i++) {
                const cellIndex = this.getActualIndex(searchIndex + i);
                if (cellIndex < cells.length) {
                    cells[cellIndex].classList.add('highlight');
                }
            }
            
            // Check if pattern matches
            const matches = pattern.every((value, i) => 
                arrayValues[searchIndex + i] === value
            );
            
            if (matches) {
                found = true;
                this.showFeedback("🎯", `Pattern [${pattern.join(', ')}] found at position ${searchIndex}!`, "success");
                this.playSound('success');
                
                // Keep highlights for found pattern
                setTimeout(() => {
                    cells.forEach(cell => cell.classList.remove('highlight'));
                }, 2000);
                return;
            }
            
            // Clear highlights and move to next position
            setTimeout(() => {
                cells.forEach(cell => cell.classList.remove('highlight'));
                searchIndex++;
                searchStep();
            }, 500);
        };
        
        searchStep();
    }

    getActualIndex(logicalIndex) {
        let actualIndex = 0;
        let logicalCount = 0;
        
        for (let i = 0; i < this.array.length; i++) {
            if (this.array[i] !== null) {
                if (logicalCount === logicalIndex) {
                    return i;
                }
                logicalCount++;
            }
        }
        return actualIndex;
    }

    checkWinCondition() {
        const arrayValues = this.array.filter(x => x !== null);
        
        if (this.isPatternFound(arrayValues, this.targetPattern)) {
            this.gameActive = false;
            clearInterval(this.timer);
            
            setTimeout(() => {
                this.showGameOverModal(true);
            }, 1000);
        }
    }

    isPatternFound(array, pattern) {
        for (let i = 0; i <= array.length - pattern.length; i++) {
            if (pattern.every((value, j) => array[i + j] === value)) {
                return true;
            }
        }
        return false;
    }

    resetArray() {
        this.array = new Array(8).fill(null);
        this.operationsUsed = 0;
        this.renderArray();
        this.updateUI();
        this.showFeedback("🔄", "Array reset! Ready for new operations.", "normal");
        this.playSound('reset');
    }

    nextLevel() {
        this.currentLevel++;
        this.score += this.calculateLevelScore();
        this.operationsUsed = 0;
        this.timeLeft = 300;
        this.gameActive = true;
        
        this.generateTargetPattern();
        this.resetArray();
        this.updateUI();
        this.startTimer();
        
        document.getElementById('next-level-btn').style.display = 'none';
        document.getElementById('game-over-modal').classList.remove('show');
        
        this.showFeedback("🚀", `Level ${this.currentLevel} initiated! Find the new pattern.`, "success");
        this.playSound('levelup');
    }

    restartGame() {
        this.currentLevel = 1;
        this.score = 0;
        this.operationsUsed = 0;
        this.timeLeft = 300;
        this.gameActive = true;
        
        this.generateTargetPattern();
        this.resetArray();
        this.updateUI();
        this.startTimer();
        
        document.getElementById('next-level-btn').style.display = 'none';
        document.getElementById('game-over-modal').classList.remove('show');
        
        this.showFeedback("🔄", "Game restarted! Good luck, hacker.", "normal");
        this.playSound('restart');
    }

    startTimer() {
        if (this.timer) clearInterval(this.timer);
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateUI();
            
            if (this.timeLeft <= 0) {
                this.gameActive = false;
                clearInterval(this.timer);
                this.showFeedback("⏰", "Time's up! Mission failed.", "error");
                this.playSound('timeout');
                
                setTimeout(() => {
                    this.showGameOverModal(false);
                }, 2000);
            } else if (this.timeLeft <= 10) {
                this.showFeedback("⚠️", `Warning! Only ${this.timeLeft} seconds left!`, "warning");
            }
        }, 1000);
    }

    updateUI() {
        document.getElementById('level').textContent = this.currentLevel;
        document.getElementById('timer').textContent = this.timeLeft;
        document.getElementById('score').textContent = this.score;
    }

    updateScore() {
        const timeBonus = Math.max(0, this.timeLeft * 10);
        const operationPenalty = this.operationsUsed * 5;
        this.score = Math.max(0, timeBonus - operationPenalty);
    }

    calculateLevelScore() {
        const timeBonus = Math.max(0, this.timeLeft * 10);
        const operationPenalty = this.operationsUsed * 5;
        const levelBonus = this.currentLevel * 100;
        return Math.max(0, timeBonus - operationPenalty + levelBonus);
    }

    showFeedback(icon, message, type) {
        const panel = document.getElementById('feedback-panel');
        const content = document.getElementById('feedback-content');
        
        panel.className = `feedback-panel feedback-${type}`;
        content.innerHTML = `
            <div class="feedback-icon">${icon}</div>
            <div class="feedback-text">${message}</div>
        `;
        
        // Add animation
        panel.style.transform = 'scale(0.95)';
        panel.style.transition = 'transform 0.2s ease';
        
        setTimeout(() => {
            panel.style.transform = 'scale(1)';
        }, 50);
    }

    showGameOverModal(won) {
        const modal = document.getElementById('game-over-modal');
        const title = document.getElementById('modal-title');
        const timeTaken = document.getElementById('time-taken');
        const operationsUsed = document.getElementById('operations-used');
        const finalScore = document.getElementById('final-score');
        const continueBtn = document.getElementById('continue-btn');
        
        if (won) {
            title.textContent = 'LEVEL COMPLETE!';
            title.style.color = '#00ff88';
            continueBtn.style.display = 'inline-block';
            this.playSound('victory');
        } else {
            title.textContent = 'MISSION FAILED!';
            title.style.color = '#ff6b6b';
            continueBtn.style.display = 'none';
            this.playSound('failure');
        }
        
        timeTaken.textContent = `${60 - this.timeLeft}s`;
        operationsUsed.textContent = this.operationsUsed;
        finalScore.textContent = this.calculateLevelScore();
        
        modal.classList.add('show');
        
        if (won && this.currentLevel < 3) {
            document.getElementById('next-level-btn').style.display = 'inline-block';
        }
    }

    playSound(type) {
        // Create audio context for sound effects
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        const sounds = {
            insert: () => this.createBeep(audioContext, 800, 0.1),
            delete: () => this.createBeep(audioContext, 400, 0.1),
            search: () => this.createBeep(audioContext, 600, 0.2),
            success: () => this.createChord(audioContext, [523, 659, 784], 0.3),
            error: () => this.createBeep(audioContext, 200, 0.3),
            victory: () => this.createChord(audioContext, [523, 659, 784, 1047], 0.5),
            failure: () => this.createBeep(audioContext, 150, 0.5),
            timeout: () => this.createBeep(audioContext, 100, 0.8),
            reset: () => this.createBeep(audioContext, 500, 0.1),
            levelup: () => this.createChord(audioContext, [659, 784, 1047], 0.4),
            restart: () => this.createBeep(audioContext, 300, 0.2)
        };
        
        if (sounds[type]) {
            sounds[type]();
        }
    }

    createBeep(audioContext, frequency, duration) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }

    createChord(audioContext, frequencies, duration) {
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.createBeep(audioContext, freq, duration);
            }, index * 100);
        });
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new CodeBreakerGame();
});

// Add some extra visual effects
document.addEventListener('DOMContentLoaded', () => {
    // Add matrix-style background effect
    createMatrixEffect();
    
    // Add typing effect to mission brief
    typeWriterEffect();
});

function createMatrixEffect() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '-1';
    canvas.style.opacity = '0.1';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const chars = '01';
    const charArray = chars.split('');
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = [];
    
    for (let i = 0; i < columns; i++) {
        drops[i] = 1;
    }
    
    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#00ff88';
        ctx.font = fontSize + 'px monospace';
        
        for (let i = 0; i < drops.length; i++) {
            const text = charArray[Math.floor(Math.random() * charArray.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    
    setInterval(draw, 50);
}

function typeWriterEffect() {
    const text = "Find the secret pattern hidden in the array. Insert digits, delete mistakes, and search for clues!";
    const element = document.getElementById('mission-text');
    let i = 0;
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, 50);
        }
    }
    
    setTimeout(type, 1000);
}
