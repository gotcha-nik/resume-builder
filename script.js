document.addEventListener("DOMContentLoaded", () => {
    // --- DOM ELEMENT REFERENCES ---
    const form = document.getElementById("resume-form");
    const previewBtn = document.getElementById("previewBtn");
    const saveBtn = document.getElementById("saveBtn");
    const loadBtn = document.getElementById("loadBtn");
    const resetBtn = document.getElementById("resetBtn");
    const skillInput = document.getElementById('skill-input');
    const skillsContainer = document.getElementById('skills-container');

    const dynamicSections = {
        education: { listId: 'education-list', templateId: 'education-template' },
        experience: { listId: 'experience-list', templateId: 'experience-template' },
        projects: { listId: 'projects-list', templateId: 'project-template' },
        certifications: { listId: 'certifications-list', templateId: 'certification-template' },
    };

    let photoBase64 = '';

    // --- HELPER FUNCTIONS ---
    const get = id => document.getElementById(id)?.value || '';
    const escapeHtml = str => String(str || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[m]);
    
    // --- DYNAMIC SECTION HANDLING ---
    // Modified to return the new element for easier population
    function addDynamicItem(section) {
        const template = document.getElementById(section.templateId);
        if (!template) return null;
        const clone = template.content.cloneNode(true);
        const newItem = clone.querySelector('.dynamic-item');
        document.getElementById(section.listId).appendChild(clone);
        return newItem;
    }

    // Attach event listeners for all "Add" buttons
    document.getElementById('add-education-btn').addEventListener('click', () => addDynamicItem(dynamicSections.education));
    document.getElementById('add-experience-btn').addEventListener('click', () => addDynamicItem(dynamicSections.experience));
    document.getElementById('add-project-btn').addEventListener('click', () => addDynamicItem(dynamicSections.projects));
    document.getElementById('add-certification-btn').addEventListener('click', () => addDynamicItem(dynamicSections.certifications));
    
    // Add centralized event listener for all "Remove" buttons
    form.addEventListener('click', e => {
        if (e.target.classList.contains('remove-btn')) {
            e.target.closest('.dynamic-item').remove();
        }
    });


    // --- SKILL TAGS HANDLING ---
    skillInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && skillInput.value.trim() !== '') {
            e.preventDefault();
            addSkillTag(skillInput.value.trim());
            skillInput.value = '';
        }
    });

    function addSkillTag(skill) {
        const tag = document.createElement('div');
        tag.className = 'skill-tag';
        tag.textContent = escapeHtml(skill);

        const removeSpan = document.createElement('span');
        removeSpan.className = 'remove-skill';
        removeSpan.innerHTML = '&times;';
        removeSpan.onclick = () => tag.remove();
        
        tag.appendChild(removeSpan);
        skillsContainer.appendChild(tag);
    }
    
    skillsContainer.addEventListener('click', e => {
        if (e.target.classList.contains('remove-skill')) {
            e.target.closest('.skill-tag').remove();
        }
    });


    // --- IMAGE HANDLING ---
    document.getElementById('photo').addEventListener('change', e => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => photoBase64 = event.target.result;
            reader.readAsDataURL(file);
        }
    });

    // --- DATA GATHERING & POPULATING ---
    function gatherData() {
        const data = {
            name: get("name"),
            email: get("email"),
            phone: get("phone"),
            linkedin: get("linkedin"),
            github: get("github"),
            summary: get("summary"),
            photo: photoBase64,
            education: [],
            experience: [],
            projects: [],
            skills: [],
            certifications: [],
        };

        document.querySelectorAll('#education-list .dynamic-item').forEach(item => data.education.push({ degree: item.querySelector('.degree').value, institution: item.querySelector('.institution').value, gradYear: item.querySelector('.gradYear').value, cgpa: item.querySelector('.cgpa').value }));
        document.querySelectorAll('#experience-list .dynamic-item').forEach(item => data.experience.push({ jobTitle: item.querySelector('.jobTitle').value, company: item.querySelector('.company').value, duration: item.querySelector('.duration').value, jobDesc: item.querySelector('.jobDesc').value }));
        document.querySelectorAll('#projects-list .dynamic-item').forEach(item => data.projects.push({ projTitle: item.querySelector('.projTitle').value, projDesc: item.querySelector('.projDesc').value, techStack: item.querySelector('.techStack').value, projLink: item.querySelector('.projLink').value }));
        document.querySelectorAll('#certifications-list .dynamic-item').forEach(item => data.certifications.push({ certTitle: item.querySelector('.certTitle').value, certIssuer: item.querySelector('.certIssuer').value, certYear: item.querySelector('.certYear').value }));
        document.querySelectorAll('#skills-container .skill-tag').forEach(tag => data.skills.push(tag.firstChild.textContent.trim()));

        return data;
    }

    function populateForm(data) {
        if (!data) return;
        
        // Clear existing form data and dynamic items
        clearForm();

        // Populate simple text fields
        Object.keys(data).forEach(key => {
            const el = document.getElementById(key);
            if (el && typeof data[key] === 'string' && el.type !== 'file') {
                el.value = data[key];
            }
        });
        
        photoBase64 = data.photo || '';

        // Populate dynamic sections
        data.education?.forEach(itemData => {
            const newItem = addDynamicItem(dynamicSections.education);
            if(newItem) Object.keys(itemData).forEach(key => newItem.querySelector(`.${key}`).value = itemData[key]);
        });
        data.experience?.forEach(itemData => {
            const newItem = addDynamicItem(dynamicSections.experience);
            if(newItem) Object.keys(itemData).forEach(key => newItem.querySelector(`.${key}`).value = itemData[key]);
        });
        data.projects?.forEach(itemData => {
            const newItem = addDynamicItem(dynamicSections.projects);
            if(newItem) Object.keys(itemData).forEach(key => newItem.querySelector(`.${key}`).value = itemData[key]);
        });
        data.certifications?.forEach(itemData => {
            const newItem = addDynamicItem(dynamicSections.certifications);
            if(newItem) Object.keys(itemData).forEach(key => newItem.querySelector(`.${key}`).value = itemData[key]);
        });
        data.skills?.forEach(addSkillTag);
    }
    
    function clearForm() {
        form.reset();
        skillsContainer.innerHTML = '';
        photoBase64 = '';
        document.querySelectorAll('.dynamic-item').forEach(item => item.remove());
    }
    
    // --- EVENT LISTENERS FOR MAIN BUTTONS ---
    saveBtn.addEventListener('click', () => {
        const data = gatherData();
        localStorage.setItem('resumeData', JSON.stringify(data));
        alert('Progress saved!');
    });

    loadBtn.addEventListener('click', () => {
        const savedData = localStorage.getItem('resumeData');
        if (savedData) {
            const data = JSON.parse(savedData);
            populateForm(data);
            alert('Progress loaded!');
        } else {
            alert('No saved data found.');
        }
    });

    resetBtn.addEventListener('click', () => {
        if(confirm('Are you sure you want to reset? All unsaved changes will be lost.')) {
            clearForm();
            localStorage.removeItem('resumeData');
            alert('Form has been reset.');
        }
    });

    // --- PREVIEW GENERATION (from previous step, no changes needed here) ---
    previewBtn.addEventListener('click', () => {
        try {
            const data = gatherData();
            const previewHtml = generatePreviewHtml(data);
            const previewWindow = window.open('', '_blank');
            if (!previewWindow) {
                alert('Popup blocked. Please allow popups for this site.');
                return;
            }
            previewWindow.document.write(previewHtml);
            previewWindow.document.close();
        } catch (e) {
            console.error("Error generating preview:", e);
            alert("An unexpected error occurred while generating the preview. Please check the console for details.");
        }
    });

    function generatePreviewHtml(d) {
        const generateLink = (url, text) => url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(text || url)}</a>` : '';
        const contactInfoHTML = (icon, text, protocol = '') => text ? `<span class="contact-item"><i class="fa ${icon} fa-fw"></i> ${generateLink(protocol + text, text)}</span>` : '';
        const summaryHTML = d.summary ? `<div class="section"><h2 class="section-title">Professional Summary</h2><p>${escapeHtml(d.summary).replace(/\n/g, '<br>')}</p></div>` : '';
        const projectsHTML = d.projects?.length ? `<div class="section"><h2 class="section-title">Projects</h2>${d.projects.map(p => `<div class="item"><p class="item-title">${escapeHtml(p.projTitle)}</p>${p.projLink ? `<p class="item-link">${generateLink(p.projLink, 'View Project')}</p>` : ''}<p class="item-desc">${escapeHtml(p.projDesc).replace(/\n/g, '<br>')}</p>${p.techStack ? `<p class="item-detail"><strong>Tech Stack:</strong> ${escapeHtml(p.techStack)}</p>` : ''}</div>`).join('')}</div>` : '';
        const certificationsHTML = d.certifications?.length ? `<div class="section"><h2 class="section-title">Certifications</h2>${d.certifications.map(c => `<p>${escapeHtml(c.certTitle)} ${c.certIssuer ? `— ${escapeHtml(c.certIssuer)}` : ''} ${c.certYear ? `(${escapeHtml(c.certYear)})` : ''}</p>`).join('')}</div>` : '';

        const skillsHTML = (type = 'list') => {
            if (!d.skills?.length) return '';
            if (type === 'bars') {
                return `<div class="section"><h2 class="section-title">Skills</h2>${d.skills.map(s => `<div class="skill-bar-item"><p>${escapeHtml(s)}</p><div class="skill-bar"><div class="skill-level"></div></div></div>`).join('')}</div>`;
            }
            return `<div class="section"><h2 class="section-title">Skills</h2><div class="skill-tags">${d.skills.map(s => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('')}</div></div>`;
        };

        const experienceAndEducationHTML = (type = 'list') => {
            const experience = d.experience?.length ? `<div class="section"><h2 class="section-title">Experience</h2><div class="${type === 'timeline' ? 'timeline-container' : ''}">${d.experience.map(exp => `<div class="${type === 'timeline' ? 'timeline-item' : 'item'}"><div class="timeline-marker"></div><div class="timeline-content"><p class="item-title">${escapeHtml(exp.jobTitle)}</p><p class="item-subtitle">${escapeHtml(exp.company)} | ${escapeHtml(exp.duration)}</p><p class="item-desc">${escapeHtml(exp.jobDesc).replace(/\n/g, '<br>')}</p></div></div>`).join('')}</div></div>` : '';
            const education = d.education?.length ? `<div class="section"><h2 class="section-title">Education</h2><div class="${type === 'timeline' ? 'timeline-container' : ''}">${d.education.map(edu => `<div class="${type === 'timeline' ? 'timeline-item' : 'item'}"><div class="timeline-marker"></div><div class="timeline-content"><p class="item-title">${escapeHtml(edu.degree)}</p><p class="item-subtitle">${escapeHtml(edu.institution)} | ${escapeHtml(edu.gradYear)}</p>${edu.cgpa ? `<p class="item-detail">CGPA/Percentage: ${escapeHtml(edu.cgpa)}</p>` : ''}</div></div>`).join('')}</div></div>` : '';
            return experience + education;
        };

        const renderMarquee = () => `<div class="marquee-header"><h1>${escapeHtml(d.name)}</h1><div class="contact-info">${contactInfoHTML('fa-envelope', d.email, 'mailto:')}${contactInfoHTML('fa-phone', d.phone, 'tel:')}${contactInfoHTML('fab fa-linkedin', d.linkedin)}${contactInfoHTML('fab fa-github', d.github)}</div></div><div class="marquee-content">${summaryHTML}${experienceAndEducationHTML()}${projectsHTML}${skillsHTML()}${certificationsHTML}</div>`;
        const renderInfographic = () => `<div class="infographic-main"><h1>${escapeHtml(d.name)}</h1>${summaryHTML}${experienceAndEducationHTML()}${projectsHTML}${certificationsHTML}</div><div class="infographic-sidebar">${contactInfoHTML('fa-envelope', d.email, 'mailto:')}${contactInfoHTML('fa-phone', d.phone, 'tel:')}${contactInfoHTML('fab fa-linkedin', d.linkedin)}${contactInfoHTML('fab fa-github', d.github)}${skillsHTML('bars')}</div>`;
        const renderTimeline = () => `<div class="timeline-header"><h1>${escapeHtml(d.name)}</h1><div class="contact-info">${contactInfoHTML('fa-envelope', d.email, 'mailto:')} | ${contactInfoHTML('fa-phone', d.phone, 'tel:')} | ${contactInfoHTML('fab fa-linkedin', d.linkedin)} | ${contactInfoHTML('fab fa-github', d.github)}</div></div>${summaryHTML}${experienceAndEducationHTML('timeline')}${projectsHTML}${skillsHTML()}${certificationsHTML}`;
        
        const jsEscape = (str) => str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
        const baseFileName = JSON.stringify((d.name || 'Resume').replace(/\s+/g, '_'));

        return `
            <!doctype html><html><head>
            <meta charset="utf-8"><title>Resume Preview - ${escapeHtml(d.name)}</title><meta name="viewport" content="width=device-width,initial-scale=1">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&family=Poppins:wght@600;700&display=swap" rel="stylesheet">
            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"><\/script>
            <style>
                :root{--font-head:'Poppins',sans-serif;--font-body:'Roboto',sans-serif;--c-text:#333;--c-primary:#1a73e8;--c-dark:#202124;--c-light-gray:#f1f3f4;--c-gray:#e8eaed;}
                body{margin:0;background-color:#f8f9fa;font-family:var(--font-body);color:var(--c-text);line-height:1.6;}
                .toolbar{position:sticky;top:0;background:rgba(255,255,255,0.98);padding:10px;display:flex;justify-content:center;gap:10px;align-items:center;z-index:20;border-bottom:1px solid var(--c-gray);}
                .toolbar select,.toolbar button{font-family:var(--font-body);padding:8px 12px;border-radius:6px;border:1px solid #ccc;background:#fff;cursor:pointer;font-weight:600;}
                .toolbar .download{background:var(--c-primary);color:#fff;border-color:transparent;}
                .sheet{width:100%;max-width:8.5in;min-height:11in;margin:20px auto;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.1);padding:0.5in;transition:all 0.2s ease;}
                a{text-decoration:none;color:var(--c-primary);} a:hover{text-decoration:underline;}
                h1{font-family:var(--font-head);font-weight:700;margin:0;}
                .section{margin-bottom:24px;}
                .section-title{font-family:var(--font-head);font-size:1.2rem;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:var(--c-primary);border-bottom:2px solid var(--c-light-gray);padding-bottom:6px;margin-bottom:16px;}
                .item{margin-bottom:16px;}
                .item-title{font-size:1.1rem;font-weight:700;margin:0;}
                .item-subtitle{font-size:1rem;color:#5f6368;font-style:italic;margin:2px 0 6px;}
                .item-desc,.item-detail{font-size:0.95rem;margin:4px 0;} .item-link{font-size:0.9rem;font-style:italic;}
                .contact-info{display:flex;flex-wrap:wrap;gap:15px;align-items:center;}
                .skill-tags{display:flex;flex-wrap:wrap;gap:8px;}
                .skill-tag{background:var(--c-light-gray);color:var(--c-text);padding:5px 12px;border-radius:15px;font-size:0.9rem;}
                .template-marquee .marquee-header{background:var(--c-dark);color:#fff;padding:40px;text-align:center;margin:-0.5in -0.5in 30px -0.5in;}
                .template-marquee .marquee-header h1{font-size:3.5rem;color:#fff;}
                .template-marquee .marquee-header .contact-info{color:#bdc1c6;justify-content:center;margin-top:15px;}
                .template-marquee .marquee-header a{color:#fff;}
                .template-infographic{display:grid;grid-template-columns:1fr 250px;gap:40px;}
                .template-infographic h1{font-size:3rem;margin-bottom:10px;color:var(--c-dark);}
                .template-infographic .infographic-sidebar .contact-item{display:block;margin-bottom:10px;}
                .template-infographic .infographic-sidebar .section{margin-top:30px;}
                .skill-bar-item{margin-bottom:12px;} .skill-bar-item p{margin:0 0 5px;font-weight:bold;}
                .skill-bar{width:100%;height:8px;background:var(--c-gray);border-radius:4px;}
                .skill-level{width:90%;height:100%;background:var(--c-primary);border-radius:4px;}
                .template-timeline .timeline-header{text-align:center;margin-bottom:30px;}
                .template-timeline h1{font-size:3rem;margin-bottom:10px;}
                .template-timeline .contact-info{justify-content:center;}
                .template-timeline .timeline-container{position:relative;padding-left:30px;}
                .template-timeline .timeline-container::before{content:'';position:absolute;left:5px;top:5px;bottom:5px;width:3px;background:var(--c-gray);}
                .template-timeline .timeline-item{position:relative;margin-bottom:20px;}
                .template-timeline .timeline-marker{position:absolute;left:-24px;top:5px;width:13px;height:13px;background:var(--c-primary);border-radius:50%;border:2px solid #fff;}
            </style>
            </head>
            <body>
            <div class="toolbar">
                <label for="templateSelector">Template:</label>
                <select id="templateSelector"><option value="marquee">Marquee</option><option value="infographic">Infographic</option><option value="timeline">Timeline</option></select>
                <button class="download" id="downloadBtn">Download PDF</button>
            </div>
            <div id="sheet" class="sheet"></div>
            <script>
                const renderers = {
                    marquee: \`${jsEscape(renderMarquee())}\`,
                    infographic: \`${jsEscape(renderInfographic())}\`,
                    timeline: \`${jsEscape(renderTimeline())}\`
                };
                function setTemplate(name) {
                    const sheet = document.getElementById('sheet');
                    sheet.className = 'sheet template-' + name;
                    sheet.innerHTML = renderers[name] || renderers.marquee;
                }
                document.getElementById('templateSelector').addEventListener('change', function() { setTemplate(this.value); });
                document.getElementById('downloadBtn').addEventListener('click', function() {
                    const selector = document.getElementById('templateSelector');
                    const selectedTemplate = selector.options[selector.selectedIndex].text;
                    const baseName = ${baseFileName};
                    const filename = baseName + '_' + selectedTemplate + '.pdf';
                    const element = document.getElementById('sheet');
                    const opt = { margin: 0, filename: filename, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } };
                    html2pdf().from(element).set(opt).save();
                });
                setTemplate('marquee');
            <\/script></body></html>`;
    }
});