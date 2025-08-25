class DashboardApp {
    constructor() {
        // NEW: Updated data structure to hold shortcuts and groups
        this.appState = {
            shortcuts: [],
            groups: []
        };
        this.backgroundAnimationsContainer = document.getElementById('background-animations');
        this.draggedItem = null; // To keep track of the item being dragged
        this.init();
    }

    init() {
        this.loadAppState();
        this.setupEventListeners();
        this.updateClock();
        this.updateDate();
        this.renderDashboard();
        this.setupLoader();
        this.setupKeyboardShortcuts();
        setInterval(() => this.updateClock(), 1000);
    }
    
    // UPDATED: Load the new appState structure from localStorage
    loadAppState() {
        const storedState = localStorage.getItem('dashboardState');
        if (storedState) {
            this.appState = JSON.parse(storedState);
            // Ensure default empty arrays if loaded state is malformed
            if (!this.appState.shortcuts) this.appState.shortcuts = [];
            if (!this.appState.groups) this.appState.groups = [];
        } else {
            // Default state if nothing is saved
            this.appState = {
                shortcuts: [
                    { id: 1, name: "Gmail", url: "https://gmail.com" },
                    { id: 2, name: "GitHub", url: "https://github.com" },
                    { id: 3, name: "YouTube", url: "https://youtube.com" },
                ],
                groups: [
                    {
                        id: 100,
                        name: "AI Tools",
                        shortcuts: [
                            { id: 4, name: "ChatGPT", url: "https://chat.openai.com" },
                            { id: 5, name: "Claude", url: "https://claude.ai" },
                        ]
                    }
                ]
            };
            // Generate favicons for all default shortcuts
            this.appState.shortcuts.forEach(s => s.image = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${s.url}&size=64`);
            this.appState.groups.forEach(g => g.shortcuts.forEach(s => s.image = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${s.url}&size=64`));
            this.saveAppState();
        }

        const savedTheme = localStorage.getItem('dashboardTheme') || 'deep-blue';
        const themeElement = document.querySelector(`.theme-item[data-theme="${savedTheme}"]`);
        if (themeElement) this.changeTheme(savedTheme, themeElement);
        
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            document.getElementById('darkModeToggle').classList.add('active');
            document.body.classList.add('dark-mode');
        }
    }

    // NEW: Save the entire appState to localStorage
    saveAppState() {
        localStorage.setItem('dashboardState', JSON.stringify(this.appState));
    }
    
    // UPDATED: Event listeners for new group management buttons
    setupEventListeners() {
        document.getElementById('settingsBtn').addEventListener('click', () => this.openSidebar());
        document.getElementById('closeBtn').addEventListener('click', () => this.closeSidebar());
        document.getElementById('sidebarOverlay').addEventListener('click', () => this.closeSidebar());
        document.getElementById('searchBar').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch(e.target.value);
        });
        document.querySelectorAll('.theme-item').forEach(item => {
            item.addEventListener('click', (e) => this.changeTheme(e.currentTarget.dataset.theme, e.currentTarget));
        });
        document.getElementById('addShortcutBtn').addEventListener('click', () => this.openShortcutModal());
        document.getElementById('cancelShortcut').addEventListener('click', () => this.closeShortcutModal());
        document.getElementById('shortcutModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('shortcutModal')) this.closeShortcutModal();
        });
        document.getElementById('shortcutForm').addEventListener('submit', (e) => this.handleShortcutSubmit(e));
        document.getElementById('darkModeToggle').addEventListener('click', () => this.toggleDarkMode());

        // Group management listeners
        document.getElementById('manageGroupsBtn').addEventListener('click', () => this.toggleOrganizeMode(true));
        document.getElementById('doneOrganizingBtn').addEventListener('click', () => this.toggleOrganizeMode(false));
        document.getElementById('addGroupBtn').addEventListener('click', () => this.addGroup());
    }

    // NEW: Render the entire dashboard, including groups and shortcuts
    renderDashboard() {
        const grid = document.getElementById('shortcutsGrid');
        grid.innerHTML = '';

        // Render groups
        this.appState.groups.forEach(group => {
            const groupEl = this.createGroupElement(group);
            grid.appendChild(groupEl);
        });

        // Render ungrouped shortcuts
        this.appState.shortcuts.forEach(shortcut => {
            const card = this.createShortcutCard(shortcut);
            grid.appendChild(card);
        });
        
        this.setupDragAndDrop();
    }

    // --- Shortcut Management (Mostly Unchanged) ---
    createShortcutCard(shortcut) {
        const card = document.createElement('div');
        card.className = 'shortcut-card';
        card.dataset.shortcutId = shortcut.id; // Use data attributes for IDs
        
        const link = document.createElement('a');
        link.href = shortcut.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        Object.assign(link.style, { textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' });

        const icon = document.createElement('div');
        icon.className = 'shortcut-icon';
        if (shortcut.image) {
            const img = document.createElement('img');
            img.src = shortcut.image;
            img.alt = `${shortcut.name} logo`;
            img.onerror = () => { img.remove(); icon.textContent = shortcut.name.charAt(0).toUpperCase(); };
            icon.appendChild(img);
        } else {
            icon.textContent = shortcut.name.charAt(0).toUpperCase();
        }
        
        const name = document.createElement('div');
        name.className = 'shortcut-name';
        name.textContent = shortcut.name;
        
        link.append(icon, name);
        card.appendChild(link);
        
        const actions = document.createElement('div');
        actions.className = 'shortcut-actions';
        const editBtn = document.createElement('button');
        editBtn.className = 'shortcut-action-btn';
        editBtn.innerHTML = '✎';
        editBtn.onclick = (e) => { e.stopPropagation(); this.openShortcutModal(shortcut); };
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'shortcut-action-btn';
        deleteBtn.innerHTML = '🗑';
        deleteBtn.onclick = (e) => { e.stopPropagation(); this.deleteShortcut(shortcut.id); };
        actions.append(editBtn, deleteBtn);
        card.appendChild(actions);

        return card;
    }
    
    openShortcutModal(shortcut = null) {
        const modal = document.getElementById('shortcutModal');
        const form = document.getElementById('shortcutForm');
        const modalTitle = document.getElementById('modalTitle');
        form.reset();
        if (shortcut) {
            modalTitle.textContent = 'Edit Shortcut';
            document.getElementById('shortcutId').value = shortcut.id;
            document.getElementById('shortcutName').value = shortcut.name;
            document.getElementById('shortcutUrl').value = shortcut.url;
        } else {
            modalTitle.textContent = 'Add Shortcut';
            document.getElementById('shortcutId').value = '';
        }
        modal.classList.add('open');
    }

    closeShortcutModal() { document.getElementById('shortcutModal').classList.remove('open'); }
    
    handleShortcutSubmit(e) {
        e.preventDefault();
        const id = document.getElementById('shortcutId').value;
        const name = document.getElementById('shortcutName').value;
        const url = document.getElementById('shortcutUrl').value;
        const image = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=64`;

        if (id) { // Editing existing shortcut
            let found = false;
            this.appState.shortcuts.forEach(s => { if (s.id == id) { Object.assign(s, { name, url, image }); found = true; }});
            if (!found) {
                this.appState.groups.forEach(g => {
                    g.shortcuts.forEach(s => { if (s.id == id) { Object.assign(s, { name, url, image }); }});
                });
            }
        } else { // Adding new shortcut to the ungrouped list
            this.appState.shortcuts.push({ id: Date.now(), name, url, image });
        }
        this.saveAppState();
        this.renderDashboard();
        this.closeShortcutModal();
    }

    deleteShortcut(shortcutId) {
        if (!confirm('Are you sure you want to delete this shortcut?')) return;
        // Try to remove from ungrouped shortcuts
        this.appState.shortcuts = this.appState.shortcuts.filter(s => s.id !== shortcutId);
        // Try to remove from any group
        this.appState.groups.forEach(g => {
            g.shortcuts = g.shortcuts.filter(s => s.id !== shortcutId);
        });
        this.saveAppState();
        this.renderDashboard();
    }

    // --- NEW: Group Management ---
    createGroupElement(group) {
        const container = document.createElement('div');
        container.className = 'group-container';
        container.dataset.groupId = group.id;

        const header = document.createElement('div');
        header.className = 'group-header';
        
        const title = document.createElement('h3');
        title.className = 'group-title';
        title.textContent = group.name;
        title.setAttribute('contenteditable', 'true');
        title.addEventListener('blur', (e) => this.renameGroup(group.id, e.target.textContent));

        const groupActions = document.createElement('div');
        groupActions.className = 'group-actions';
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'group-delete-btn';
        deleteBtn.innerHTML = '🗑';
        deleteBtn.onclick = () => this.deleteGroup(group.id);
        groupActions.appendChild(deleteBtn);

        header.append(title, groupActions);

        const grid = document.createElement('div');
        grid.className = 'group-shortcuts-grid';
        group.shortcuts.forEach(shortcut => {
            grid.appendChild(this.createShortcutCard(shortcut));
        });

        container.append(header, grid);
        return container;
    }

    addGroup() {
        const newGroup = {
            id: Date.now(),
            name: "New Group",
            shortcuts: []
        };
        this.appState.groups.push(newGroup);
        this.saveAppState();
        this.renderDashboard();
    }

    renameGroup(groupId, newName) {
        const group = this.appState.groups.find(g => g.id === groupId);
        if (group && group.name !== newName) {
            group.name = newName;
            this.saveAppState();
        }
    }

    deleteGroup(groupId) {
        if (!confirm('Are you sure you want to delete this group? All shortcuts inside will become ungrouped.')) return;
        const groupIndex = this.appState.groups.findIndex(g => g.id === groupId);
        if (groupIndex > -1) {
            const group = this.appState.groups[groupIndex];
            // Move shortcuts from the group to the main shortcuts array
            this.appState.shortcuts.push(...group.shortcuts);
            // Remove the group
            this.appState.groups.splice(groupIndex, 1);
            this.saveAppState();
            this.renderDashboard();
        }
    }

    toggleOrganizeMode(enable) {
        document.body.classList.toggle('organize-mode', enable);
        document.getElementById('manageGroupsBtn').style.display = enable ? 'none' : 'inline-block';
        document.getElementById('addShortcutBtn').style.display = enable ? 'none' : 'inline-block';
        document.getElementById('doneOrganizingBtn').style.display = enable ? 'inline-block' : 'none';
        document.getElementById('addGroupBtn').style.display = enable ? 'inline-block' : 'none';
        this.renderDashboard(); // Re-render to apply/remove drag handlers
    }

    // --- NEW: Drag and Drop Logic ---
    setupDragAndDrop() {
        if (!document.body.classList.contains('organize-mode')) return;

        const shortcutCards = document.querySelectorAll('.shortcut-card');
        shortcutCards.forEach(card => {
            card.setAttribute('draggable', 'true');
            card.addEventListener('dragstart', this.handleDragStart.bind(this));
            card.addEventListener('dragend', this.handleDragEnd.bind(this));
        });

        const dropZones = document.querySelectorAll('.group-container, #shortcutsContainer');
        dropZones.forEach(zone => {
            zone.addEventListener('dragover', this.handleDragOver.bind(this));
            zone.addEventListener('dragleave', this.handleDragLeave.bind(this));
            zone.addEventListener('drop', this.handleDrop.bind(this));
        });
    }

    handleDragStart(e) {
        this.draggedItem = e.target.closest('.shortcut-card');
        this.draggedItem.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.draggedItem.dataset.shortcutId);
    }

    handleDragEnd(e) {
        this.draggedItem.classList.remove('dragging');
        this.draggedItem = null;
    }

    handleDragOver(e) {
        e.preventDefault();
        const dropZone = e.target.closest('.group-container, #shortcutsContainer');
        if (dropZone) {
            dropZone.classList.add('drag-over');
        }
    }

    handleDragLeave(e) {
        const dropZone = e.target.closest('.group-container, #shortcutsContainer');
        if (dropZone) {
            dropZone.classList.remove('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        const dropZone = e.target.closest('.group-container, #shortcutsContainer');
        if (!dropZone || !this.draggedItem) return;
        
        dropZone.classList.remove('drag-over');
        const shortcutId = parseInt(e.dataTransfer.getData('text/plain'));

        // Find and remove the shortcut from its original location
        let shortcutToMove = null;
        let originalLocation = this.appState.shortcuts;
        let itemIndex = originalLocation.findIndex(s => s.id === shortcutId);

        if (itemIndex > -1) {
            shortcutToMove = originalLocation.splice(itemIndex, 1)[0];
        } else {
            for (const group of this.appState.groups) {
                itemIndex = group.shortcuts.findIndex(s => s.id === shortcutId);
                if (itemIndex > -1) {
                    originalLocation = group.shortcuts;
                    shortcutToMove = originalLocation.splice(itemIndex, 1)[0];
                    break;
                }
            }
        }

        if (!shortcutToMove) return;

        // Add the shortcut to its new location
        if (dropZone.id === 'shortcutsContainer') {
            this.appState.shortcuts.push(shortcutToMove);
        } else {
            const groupId = parseInt(dropZone.dataset.groupId);
            const targetGroup = this.appState.groups.find(g => g.id === groupId);
            if (targetGroup) {
                targetGroup.shortcuts.push(shortcutToMove);
            }
        }

        this.saveAppState();
        this.renderDashboard();
    }


    // --- Core App Functions (Unchanged) ---
    setupLoader() { setTimeout(() => document.getElementById('loader').classList.add('hidden'), 2000); }
    setupKeyboardShortcuts() { document.addEventListener('keydown', (e) => { if (e.key === '/' && e.target !== document.getElementById('searchBar')) { e.preventDefault(); document.getElementById('searchBar').focus(); } if (e.key === 'Escape') { this.closeSidebar(); this.closeShortcutModal(); } }); }
    updateClock() { const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); document.getElementById('clock').textContent = time; }
    updateDate() { const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }; document.getElementById('date').textContent = new Date().toLocaleDateString('en-US', options); }
    handleSearch(query) { if (query.trim()) { window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank'); document.getElementById('searchBar').value = ''; } }
    openSidebar() { document.getElementById('sidebar').classList.add('open'); document.getElementById('sidebarOverlay').classList.add('open'); document.body.style.overflow = 'hidden'; }
    closeSidebar() { document.getElementById('sidebar').classList.remove('open'); document.getElementById('sidebarOverlay').classList.remove('open'); document.body.style.overflow = ''; }
    changeTheme(theme, clickedElement) { document.querySelectorAll('.theme-item').forEach(item => item.classList.remove('active')); if (clickedElement) clickedElement.classList.add('active'); localStorage.setItem('dashboardTheme', theme); const themes = { default: 'linear-gradient(-45deg, #ff9a9e, #fad0c4, #ff9a9e, #fad0c4)', forest: 'linear-gradient(-45deg, #2c3e50, #4a6741, #3d5a80, #98d8c8)', charcoal: 'linear-gradient(-45deg, #232526, #414345, #1e3c72, #2a5298)', midnight: 'linear-gradient(-45deg, #1a1a2e, #16213e, #0f3460, #533483)', obsidian: 'linear-gradient(-45deg, #000000, #434343)', 'deep-ocean': 'linear-gradient(-45deg, #141e30, #243b55, #1e3c72, #2a5298)', 'dark-teal': 'linear-gradient(-45deg, #2d1b69, #11998e, #38ef7d, #0575e6)', 'purple-teal': 'linear-gradient(-45deg, #360033, #0b8793, #667eea, #764ba2)', 'deep-blue': 'linear-gradient(-45deg, #000428, #004e92, #009ffd, #2a2a72)', 'dark-purple': 'linear-gradient(-45deg, #3c1053, #ad5389)', }; if (themes[theme]) { document.body.style.background = themes[theme]; document.body.style.backgroundSize = '400% 400%'; document.body.style.animation = 'gradientShift 15s ease infinite'; } this.applyAnimations(theme); }
    toggleDarkMode() { const toggle = document.getElementById('darkModeToggle'); toggle.classList.toggle('active'); const isDarkMode = toggle.classList.contains('active'); localStorage.setItem('darkMode', isDarkMode); document.body.classList.toggle('dark-mode', isDarkMode); }
    applyAnimations(theme) { if (!this.backgroundAnimationsContainer) return; this.backgroundAnimationsContainer.innerHTML = ''; switch (theme) { case 'obsidian': this.createShootingStars(30); break; case 'dark-purple': this.backgroundAnimationsContainer.innerHTML = '<div id="milky-way-container"></div>'; break; case 'default': this.createPetals(30); break; case 'forest': this.createFireflies(20); break; case 'deep-ocean': this.createBubbles(25); break; case 'midnight': this.createTwinklingStars(100); break; } }
    createElements(count, className, setupElement) { const container = this.backgroundAnimationsContainer; for (let i = 0; i < count; i++) { const el = document.createElement('div'); el.className = className; setupElement(el, i); container.appendChild(el); } }
    createShootingStars(count) { this.createElements(count, 'star', (el) => { const size = Math.random() * 2 + 1; const startX = Math.random() * 100 + 'vw'; const endX = (parseFloat(startX) - (Math.random() * 20 + 10)) + 'vw'; Object.assign(el.style, { width: `${size}px`, height: `${size}px`, '--start-x': startX, '--end-x': endX, animationDelay: `${Math.random() * 15}s`, animationDuration: `${Math.random() * 2 + 1}s` }); }); }
    createPetals(count) { this.createElements(count, 'petal', (el) => { const size = Math.random() * 5 + 10; Object.assign(el.style, { left: `${Math.random() * 100}vw`, width: `${size}px`, height: `${size}px`, animationDelay: `${Math.random() * 10}s`, animationDuration: `${Math.random() * 10 + 10}s` }); }); }
    createFireflies(count) { this.createElements(count, 'firefly', (el) => { Object.assign(el.style, { '--start-x': `${Math.random() * 100}vw`, '--start-y': `${Math.random() * 100}vh`, '--end-x': `${Math.random() * 100}vw`, '--end-y': `${Math.random() * 100}vh`, animationDelay: `${Math.random() * 15}s`, animationDuration: `${Math.random() * 10 + 5}s` }); }); }
    createBubbles(count) { this.createElements(count, 'bubble', (el) => { const size = Math.random() * 10 + 5; Object.assign(el.style, { left: `${Math.random() * 100}vw`, width: `${size}px`, height: `${size}px`, '--drift-x': `${(Math.random() - 0.5) * 100}px`, animationDelay: `${Math.random() * 20}s`, animationDuration: `${Math.random() * 15 + 10}s` }); }); }
    createTwinklingStars(count) { this.createElements(count, 'twinkle-star', (el) => { const size = Math.random() * 2 + 1; Object.assign(el.style, { top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, width: `${size}px`, height: `${size}px`, animationDelay: `${Math.random() * 5}s` }); }); }
}

document.addEventListener('DOMContentLoaded', () => new DashboardApp());