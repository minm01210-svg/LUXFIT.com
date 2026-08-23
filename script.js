const menu = document.querySelector('#menu-icon');
const navbar = document.querySelector('.navbar');

if (menu && navbar) {
    menu.onclick = () => {
        menu.classList.toggle('bx-x');
        navbar.classList.toggle('active');
        // close services submenu when nav is closed (mobile)
        const servicesParent = document.querySelector('.services-menu');
        if (servicesParent && !navbar.classList.contains('active')) {
            servicesParent.classList.remove('open');
            const toggle = servicesParent.querySelector('.services-toggle');
            if (toggle) toggle.setAttribute('aria-expanded', 'false');
        }
    };

    window.onscroll = () => {
        menu.classList.remove('bx-x');
        navbar.classList.remove('active');
    };
}

// typing text code
const typedTarget = document.querySelector('.multiple-text');
if (typedTarget && typeof Typed !== 'undefined') {
    new Typed('.multiple-text', {
        strings: ['Fitness Training', 'Skincare Solutions', 'Healthy Lifestyle', 'Body Transformation'],
        typeSpeed: 50,
    });
}






    

document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Services Main Menu Toggle
    const servicesToggle = document.querySelector('.services-toggle');
    if (servicesToggle) {
        servicesToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const parent = this.closest('.services-menu');
            parent.classList.toggle('open');
            
            const isOpen = parent.classList.contains('open');
            this.setAttribute('aria-expanded', isOpen);
        });
    }

    // 2. Fitness & Skincare Nested Menus Toggle
    const nestedToggles = document.querySelectorAll('.nested-toggle');
    nestedToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const currentParent = this.closest('.has-nested');

            // အခြားပွင့်နေသော Sub-menu များကို ပိတ်ခြင်း
            document.querySelectorAll('.has-nested').forEach(item => {
                if (item !== currentParent) {
                    item.classList.remove('open');
                }
            });

            // လက်ရှိ Sub-menu ကို Toggle လုပ်ခြင်း
            currentParent.classList.toggle('open');
        });
    });

    // 3. Close Dropdowns when clicking anywhere outside
    document.addEventListener('click', function(e) {
        const servicesMenu = document.querySelector('.services-menu');
        if (servicesMenu && !servicesMenu.contains(e.target)) {
            // Main menu ပိတ်ရန်
            servicesMenu.classList.remove('open');
            if (servicesToggle) {
                servicesToggle.setAttribute('aria-expanded', 'false');
            }
            // Sub-menus အားလုံး ပိတ်ရန်
            document.querySelectorAll('.has-nested').forEach(item => {
                item.classList.remove('open');
            });
        }
    });

});