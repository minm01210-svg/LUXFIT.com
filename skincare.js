        // Page Navigation Controller
        function goToPage(pageId) {
            const pages = document.querySelectorAll('.page');
            pages.forEach(p => p.classList.remove('active'));

            document.body.classList.remove('theme-skincare', 'theme-fitness');
            if (pageId === 'skincare-page') {
                document.body.classList.add('theme-skincare');
            } else if (pageId === 'fitness-page') {
                document.body.classList.add('theme-fitness');
            }

            const target = document.getElementById(pageId);
            if (target) {
                target.classList.add('active');
            }

            updateHeaderNav(pageId);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Header Navigation Links Controller
        function updateHeaderNav(pageId) {
            const nav = document.getElementById('header-nav');
            const switchFitnessBtn = document.getElementById('switch-to-fitness-link');
            const switchSkincareBtn = document.getElementById('switch-to-skincare-link');

            if (nav) {
                if (pageId === 'landing-page' || pageId === 'signin-page') {
                    nav.style.display = 'none';
                } else {
                    nav.style.display = 'flex';
                }
            }

            if (switchFitnessBtn) {
                switchFitnessBtn.style.display = (pageId === 'skincare-page') ? 'inline-block' : 'none';
            }

            if (switchSkincareBtn) {
                switchSkincareBtn.style.display = (pageId === 'fitness-page') ? 'inline-block' : 'none';
            }
        }

        // Form Sign-In Handler
        function handleSignIn(e) {
            e.preventDefault();
            const gender = document.getElementById('user-gender').value;
            const preference = document.getElementById('user-preference').value;

            if (preference === 'Skincare') {
                goToPage('skincare-page');
            } else if (preference === 'Fitness') {
                goToPage('fitness-page');
            } else if (preference === 'None') {
                if (gender === 'Female') {
                    goToPage('skincare-page');
                } else if (gender === 'Male') {
                    goToPage('fitness-page');
                } else {
                    goToPage('skincare-page');
                }
            }
        }

        // Toggle Option Panel
        function toggleOptionsPanel() {
            const panel = document.getElementById('optionsPanel');
            panel.style.display = (panel.style.display === "block") ? "none" : "block";
        }

        // Search Engine Function with Dynamic Filtering & Section Reordering
        function generateSuggestion() {
            const part = document.getElementById('partSelect').value;
            const skinType = document.getElementById('skinTypeSelect').value;
            const goal = document.getElementById('goalSelect').value;
            const resultBox = document.getElementById('resultBox');

            if (!part || !skinType || !goal) {
                alert("Please fill in all search criteria!");
                return;
            }

            resultBox.style.display = "block";

            let targetSectionId = "skincare-head";
            if (part === "Body") targetSectionId = "skincare-body";
            if (part === "Limbs") targetSectionId = "skincare-limbs";

            const dryCure = document.querySelectorAll('.dry-cure');
            const dryProtection = document.querySelectorAll('.dry-protection');
            const oilyCure = document.querySelectorAll('.oily-cure');
            const oilyProtection = document.querySelectorAll('.oily-protection');
            const sensitiveCure = document.querySelectorAll('.sensitive-cure');
            const sensitiveProtection = document.querySelectorAll('.sensitive-protection');
            
            const oilyFaceCure = document.querySelectorAll('.oily-face-cure');
            const oilyFaceProtection = document.querySelectorAll('.oily-face-protection');
            const dryFaceCure = document.querySelectorAll('.dry-face-cure');
            const dryFaceProtection = document.querySelectorAll('.dry-face-protection');
            const sensitiveFaceCure = document.querySelectorAll('.sensitive-face-cure');
            const sensitiveFaceProtection = document.querySelectorAll('.sensitive-face-protection');

            const dryBodyCure = document.querySelectorAll('.dry-body-cure');
            const dryBodyProtection = document.querySelectorAll('.dry-body-protection');

            const oilyBodyCure = document.querySelectorAll('.oily-body-cure');
            const oilyBodyProtection = document.querySelectorAll('.oily-body-protection');

            const headSection = document.getElementById('skincare-head');
            const bodySection = document.getElementById('skincare-body');

            const sensitiveContainer = document.getElementById('sensitive-hair-conditions-container');
            const sensitiveFaceContainer = document.getElementById('sensitive-face-conditions-container');
            const oilyContainer = document.getElementById('oily-hair-conditions-container');
            const dryContainer = document.getElementById('dry-hair-conditions-container');
            const oilyFaceContainer = document.getElementById('oily-face-conditions-container');
            const dryFaceContainer = document.getElementById('dry-face-conditions-container');
            const dryBodyContainer = document.getElementById('dry-body-conditions-container');
            const oilyBodyContainer = document.getElementById('oily-body-conditions-container');

            if (part === "Body" && skinType === "Oily") {
                if (bodySection && oilyBodyContainer) {
                    bodySection.insertBefore(oilyBodyContainer, bodySection.children[1]);
                }

                if (goal === "Cure") {
                    oilyBodyCure.forEach(el => el.style.display = "block");
                    oilyBodyProtection.forEach(el => el.style.display = "none");

                    resultBox.innerHTML = `
                        <h4>💡 Filtered View: Oily Body Cure & Treatment Methods</h4>
                        <p>Showing <strong>Symptoms, Cure Methods, and Cure Products</strong> available in Myanmar. Protection sections have been hidden.</p>
                    `;
                } else if (goal === "Protection") {
                    oilyBodyProtection.forEach(el => el.style.display = "block");
                    oilyBodyCure.forEach(el => el.style.display = "none");

                    resultBox.innerHTML = `
                        <h4>💡 Filtered View: Oily Body Protection & Maintenance</h4>
                        <p>Showing <strong>Symptoms, Protection Methods, and Protection Products</strong> available in Myanmar. Cure sections have been hidden.</p>
                    `;
                }
                targetSectionId = "oily-body-conditions-container";
            } else if (part === "Body" && skinType === "Dry") {
                if (bodySection && dryBodyContainer) {
                    bodySection.insertBefore(dryBodyContainer, bodySection.children[1]);
                }

                if (goal === "Cure") {
                    dryBodyCure.forEach(el => el.style.display = "block");
                    dryBodyProtection.forEach(el => el.style.display = "none");

                    resultBox.innerHTML = `
                        <h4>💡 Filtered View: Dry Body Cure & Treatment Methods</h4>
                        <p>Showing <strong>Symptoms, Cure Methods, and Cure Products</strong>. Protection sections have been hidden.</p>
                    `;
                } else if (goal === "Protection") {
                    dryBodyProtection.forEach(el => el.style.display = "block");
                    dryBodyCure.forEach(el => el.style.display = "none");

                    resultBox.innerHTML = `
                        <h4>💡 Filtered View: Dry Body Protection & Maintenance</h4>
                        <p>Showing <strong>Symptoms, Protection Methods, and Protection Products</strong>. Cure sections have been hidden.</p>
                    `;
                }
                targetSectionId = "dry-body-conditions-container";
            } else if (part === "Face" && skinType === "Sensitive") {
                if (headSection && sensitiveFaceContainer) {
                    headSection.insertBefore(sensitiveFaceContainer, headSection.children[1]);
                }

                if (goal === "Cure") {
                    sensitiveFaceCure.forEach(el => el.style.display = "block");
                    sensitiveFaceProtection.forEach(el => el.style.display = "none");

                    resultBox.innerHTML = `
                        <h4>💡 Filtered View: Sensitive Face Cure & Treatment Methods</h4>
                        <p>Showing <strong>Symptoms, Cure Methods, and Cure Products</strong>. Protection sections have been hidden.</p>
                    `;
                } else if (goal === "Protection") {
                    sensitiveFaceProtection.forEach(el => el.style.display = "block");
                    sensitiveFaceCure.forEach(el => el.style.display = "none");

                    resultBox.innerHTML = `
                        <h4>💡 Filtered View: Sensitive Face Protection & Maintenance</h4>
                        <p>Showing <strong>Symptoms, Protection Methods, and Protection Products</strong>. Cure sections have been hidden.</p>
                    `;
                }
                targetSectionId = "sensitive-face-conditions-container";
            } else if (part === "Face" && skinType === "Dry") {
                if (headSection && dryFaceContainer) {
                    headSection.insertBefore(dryFaceContainer, headSection.children[1]);
                }

                if (goal === "Cure") {
                    dryFaceCure.forEach(el => el.style.display = "block");
                    dryFaceProtection.forEach(el => el.style.display = "none");

                    resultBox.innerHTML = `
                        <h4>💡 Filtered View: Dry Face Cure & Treatment Methods</h4>
                        <p>Showing <strong>Symptoms, Cure Methods, and Cure Products</strong>. Protection sections have been hidden.</p>
                    `;
                } else if (goal === "Protection") {
                    dryFaceProtection.forEach(el => el.style.display = "block");
                    dryFaceCure.forEach(el => el.style.display = "none");

                    resultBox.innerHTML = `
                        <h4>💡 Filtered View: Dry Face Protection & Maintenance</h4>
                        <p>Showing <strong>Symptoms, Protection Methods, and Protection Products</strong>. Cure sections have been hidden.</p>
                    `;
                }
                targetSectionId = "dry-face-conditions-container";
            } else if (part === "Head" && skinType === "Sensitive") {
                if (headSection && sensitiveContainer) {
                    headSection.insertBefore(sensitiveContainer, headSection.children[1]);
                }

                if (goal === "Cure") {
                    sensitiveCure.forEach(el => el.style.display = "block");
                    sensitiveProtection.forEach(el => el.style.display = "none");

                    resultBox.innerHTML = `
                        <h4>💡 Filtered View: Sensitive Scalp Cure & Treatment Methods</h4>
                        <p>Showing <strong>Symptoms, Cure Methods, and Cure Products</strong>. Protection sections have been hidden.</p>
                    `;
                } else if (goal === "Protection") {
                    sensitiveProtection.forEach(el => el.style.display = "block");
                    sensitiveCure.forEach(el => el.style.display = "none");

                    resultBox.innerHTML = `
                        <h4>💡 Filtered View: Sensitive Scalp Protection & Maintenance</h4>
                        <p>Showing <strong>Symptoms, Protection Methods, and Protection Products</strong>. Protection sections have been hidden.</p>
                    `;
                }
                targetSectionId = "sensitive-hair-conditions-container";
            } else if (part === "Face" && skinType === "Oily") {
                if (headSection && oilyFaceContainer) {
                    headSection.insertBefore(oilyFaceContainer, headSection.children[1]);
                }

                if (goal === "Cure") {
                    oilyFaceCure.forEach(el => el.style.display = "block");
                    oilyFaceProtection.forEach(el => el.style.display = "none");

                    resultBox.innerHTML = `
                        <h4>💡 Filtered View: Oily Face Cure & Treatment Methods</h4>
                        <p>Showing <strong>Symptoms, Cure Methods, and Cure Products</strong>. Protection sections have been hidden.</p>
                    `;
                } else if (goal === "Protection") {
                    oilyFaceProtection.forEach(el => el.style.display = "block");
                    oilyFaceCure.forEach(el => el.style.display = "none");

                    resultBox.innerHTML = `
                        <h4>💡 Filtered View: Oily Face Protection & Maintenance</h4>
                        <p>Showing <strong>Symptoms, Protection Methods, and Protection Products</strong>. Cure sections have been hidden.</p>
                    `;
                }
                targetSectionId = "oily-face-conditions-container";
            } else if (part === "Head" && skinType === "Oily") {
                if (headSection && oilyContainer) {
                    headSection.insertBefore(oilyContainer, headSection.children[1]);
                }

                if (goal === "Cure") {
                    oilyCure.forEach(el => el.style.display = "block");
                    oilyProtection.forEach(el => el.style.display = "none");

                    resultBox.innerHTML = `
                        <h4>💡 Filtered View: Oily Scalp Cure & Treatment Methods</h4>
                        <p>Showing <strong>Cause, Cure Methods, and Cure Products</strong> available in Myanmar. Protection sections have been hidden.</p>
                    `;
                } else if (goal === "Protection") {
                    oilyProtection.forEach(el => el.style.display = "block");
                    oilyCure.forEach(el => el.style.display = "none");

                    resultBox.innerHTML = `
                        <h4>💡 Filtered View: Oily Scalp Protection & Maintenance</h4>
                        <p>Showing <strong>Cause, Protection Methods, and Protection Products</strong> available in Myanmar. Protection sections have been hidden.</p>
                    `;
                }
                targetSectionId = "oily-hair-conditions-container";
            } else if (part === "Head" && skinType === "Dry") {
                if (goal === "Protection") {
                    dryProtection.forEach(el => el.style.display = "block");
                    dryCure.forEach(el => el.style.display = "none");

                    resultBox.innerHTML = `
                        <h4>💡 Filtered View: Dry Scalp Protection Methods</h4>
                        <p>Showing <strong>Protection Methods & Products</strong> for Dry Head/Scalp conditions.</p>
                    `;
                } else if (goal === "Cure") {
                    dryCure.forEach(el => el.style.display = "block");
                    dryProtection.forEach(el => el.style.display = "none");

                    resultBox.innerHTML = `
                        <h4>💡 Filtered View: Dry Scalp Cure Methods</h4>
                        <p>Showing <strong>Cure / Treatment Methods & Products</strong> for Dry Head/Scalp conditions.</p>
                    `;
                }
                targetSectionId = "dry-hair-conditions-container";
            } else {
                dryCure.forEach(el => el.style.display = "block");
                dryProtection.forEach(el => el.style.display = "block");
                oilyCure.forEach(el => el.style.display = "block");
                oilyProtection.forEach(el => el.style.display = "block");
                sensitiveCure.forEach(el => el.style.display = "block");
                sensitiveProtection.forEach(el => el.style.display = "block");
                oilyFaceCure.forEach(el => el.style.display = "block");
                oilyFaceProtection.forEach(el => el.style.display = "block");
                dryFaceCure.forEach(el => el.style.display = "block");
                dryFaceProtection.forEach(el => el.style.display = "block");
                sensitiveFaceCure.forEach(el => el.style.display = "block");
                sensitiveFaceProtection.forEach(el => el.style.display = "block");
                dryBodyCure.forEach(el => el.style.display = "block");
                dryBodyProtection.forEach(el => el.style.display = "block");
                oilyBodyCure.forEach(el => el.style.display = "block");
                oilyBodyProtection.forEach(el => el.style.display = "block");

                let goalAdvice = (goal === "Cure") ? 
                    `Look for active treatment ingredients in the section below.` : 
                    `Focus on protective maintenance products in the section below.`;

                resultBox.innerHTML = `
                    <h4>💡 Matched Routine Target (${part}):</h4>
                    <p>For your <strong>${part}</strong> (<strong>${skinType}</strong> Type - <strong>${goal}</strong>), scroll down to view the highlighted section. ${goalAdvice}</p>
                `;
            }

            const targetSection = document.getElementById(targetSectionId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
