pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        const PDF_FOLDER = './pdfs/';
        const pdfFiles = [
            'BOTTOMS.pdf',
            'DENIM.pdf'
        ];

        async function renderPDFThumbnail(filePath, canvasId) {
            try {
                const canvas = document.getElementById(canvasId);
                const loadingDiv = canvas.nextElementSibling;
                
                const pdf = await pdfjsLib.getDocument(filePath).promise;
                const page = await pdf.getPage(1);
                const viewport = page.getViewport({ scale: 1.5 });
                const context = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                await page.render({ canvasContext: context, viewport: viewport }).promise;
                
                if (loadingDiv && loadingDiv.classList.contains('loading')) {
                    loadingDiv.style.display = 'none';
                }
            } catch (error) {
                console.error('Error rendering PDF thumbnail:', error);
                const canvas = document.getElementById(canvasId);
                const loadingDiv = canvas.nextElementSibling;
                if (loadingDiv && loadingDiv.classList.contains('loading')) {
                    loadingDiv.textContent = 'Preview unavailable';
                }
            }
        }

        function generateCollections() {
            return pdfFiles.map(filename => {
                const displayName = filename.replace('.pdf', '');
                return {
                    name: displayName,
                    fileName: filename,
                    filePath: PDF_FOLDER + filename
                };
            });
        }

        function renderCollections() {
            const grid = document.getElementById('collectionsGrid');
            const collections = generateCollections();
            
            if (collections.length === 0) {
                grid.innerHTML = '<div style="text-align: center; grid-column: 1/-1;">No collections available.</div>';
                return;
            }
            
            grid.innerHTML = collections.map((collection, index) => `
                <div class="collection-card" onclick="viewPDF('${collection.filePath}', '${collection.name}')">
                    <div class="pdf-thumbnail">
                        <canvas id="thumbnail-${index}"></canvas>
                        <div class="loading">Loading preview...</div>
                    </div>
                    <div class="collection-info">
                        <h3>${collection.name}</h3>
                        <button class="btn view-btn">View Collection</button>
                    </div>
                </div>
            `).join('');
            
            collections.forEach((collection, index) => {
                renderPDFThumbnail(collection.filePath, `thumbnail-${index}`);
            });
        }

        const pdfModal = document.getElementById('pdfModal');
        const closeBtn = document.querySelector('.close');

        closeBtn.onclick = () => pdfModal.style.display = 'none';
        window.onclick = (e) => {
            if (e.target === pdfModal) pdfModal.style.display = 'none';
        };

        function viewPDF(filePath, name) {
            document.getElementById('pdfTitle').textContent = name;
            document.getElementById('pdfEmbed').src = filePath;
            pdfModal.style.display = 'block';
        }

        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navLinks = document.getElementById('navLinks');

        if (mobileMenuBtn && navLinks) {
            mobileMenuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                navLinks.classList.toggle('active');
                console.log('Menu toggled:', navLinks.classList.contains('active'));
            });

            // Close mobile menu when clicking on a link
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.addEventListener('click', () => {
                    navLinks.classList.remove('active');
                });
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                    navLinks.classList.remove('active');
                }
            });
        }

        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        document.addEventListener('DOMContentLoaded', renderCollections);