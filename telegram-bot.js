const bwipjs = require('bwip-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
const { Telegraf, session, Markup } = require('telegraf');
const axios = require('axios');
const FormData = require('form-data');
const { createCanvas, loadImage, registerFont } = require('canvas');

// Register fonts
try {
    const ebrimaPath = 'C:\\Windows\\Fonts\\ebrima.ttf';
    const ebrimaBoldPath = 'C:\\Windows\\Fonts\\ebrimabd.ttf';
    if (fs.existsSync(ebrimaPath)) registerFont(ebrimaPath, { family: 'Ebrima' });
    if (fs.existsSync(ebrimaBoldPath)) registerFont(ebrimaBoldPath, { family: 'EbrimaBold' });
    console.log('Fonts registered');
} catch (e) {
    console.error('Font registration failed:', e.message);
}

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
bot.use(session());

const JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTY0YTkyYTBiYzlhMDlmMjdmYjY0YjkiLCJpYXQiOjE3NzMxNjI3ODUsImV4cCI6MTc3Mzc2NzU4NX0.sBYNIOPetKwecdp_aCZZLqUkvAsOY-4hK__wHubL0SY";
const API_URL = "https://api.affiliate.pro.et/api/v1/process-screenshots";

const INITIAL_SESSION = { 
    step: 0, 
    images: [], 
    data: null, 
    allProcessedData: [],
    templateChoice: 'front-template.jpg',
    backTemplateChoice: 'back-template.jpg',
    filterChoice: 'color'
};

bot.start((ctx) => {
    ctx.session = { ...INITIAL_SESSION, allProcessedData: [] };
    ctx.reply('Welcome! 🇪🇹\nI will help you process your Fayda IDs.\n\nPlease upload **Image 1 (Popup/Photo + QR)**. (Or type /skip)');
});

bot.command('skip', (ctx) => {
    if (!ctx.session || (ctx.session.step !== 0 && ctx.session.step !== 1)) return ctx.reply('Invalid command for this step.');
    ctx.session.images[ctx.session.step] = null;
    ctx.session.step++;
    const nextMsg = ctx.session.step === 1 ? 'Now please upload **Image 2 (Front ID Card)**.' : 'Now please upload **Image 3 (Back ID Card)**.';
    ctx.reply('Skipped. ' + nextMsg);
});

bot.on('photo', async (ctx) => {
    if (!ctx.session) ctx.session = { ...INITIAL_SESSION, allProcessedData: [] };
    
    const photo = ctx.message.photo.pop();
    const fileId = photo.file_id;
    const fileLink = await ctx.telegram.getFileLink(fileId);
    
    ctx.session.images[ctx.session.step] = fileLink.href;
    
    if (ctx.session.step === 0) {
        ctx.session.step = 1;
        ctx.reply('✅ Image 1 received.\nNow upload **Image 2 (Front ID Card)**.');
    } else if (ctx.session.step === 1) {
        ctx.session.step = 2;
        ctx.reply('✅ Image 2 received.\nNow upload **Image 3 (Back ID Card)**.');
    } else if (ctx.session.step === 2) {
        ctx.reply('🚀 All 3 images received! Processing... ⏳');
        await processId(ctx);
    }
});

async function processId(ctx) {
    try {
        const formData = new FormData();
        const [img1, img2, img3] = ctx.session.images;
        
        if (img1) {
            const resp1 = await axios.get(img1, { responseType: 'arraybuffer' });
            formData.append('image1', Buffer.from(resp1.data), { filename: 'image1.jpg' });
        }
        const resp2 = await axios.get(img2, { responseType: 'arraybuffer' });
        formData.append('image2', Buffer.from(resp2.data), { filename: 'image2.jpg' });
        const resp3 = await axios.get(img3, { responseType: 'arraybuffer' });
        formData.append('image3', Buffer.from(resp3.data), { filename: 'image3.jpg' });

        const response = await axios.post(API_URL, formData, {
            headers: { ...formData.getHeaders(), 'Authorization': `Bearer ${JWT_TOKEN}` }
        });

        if (response.data) {
            ctx.session.currentIdData = response.data;
            await ctx.reply('✅ Data Extracted! Choose Template:', 
                Markup.inlineKeyboard([
                    [Markup.button.callback('Template A', 'tpl_a')],
                    [Markup.button.callback('Template B', 'tpl_b')],
                    [Markup.button.callback('Template C', 'tpl_c')]
                ])
            );
        } else {
            ctx.reply('❌ Failed to process. Try again.');
        }
    } catch (error) {
        console.error('Error:', error.message);
        ctx.reply('❌ Error: ' + error.message);
    }
}

// Template/Style handlers
bot.action(['tpl_a', 'tpl_b', 'tpl_c'], async (ctx) => {
    const mapping = {
        'tpl_a': ['front-template.jpg', 'back-template.jpg'],
        'tpl_b': ['front-templateb.jpg', 'back-template.jpg'],
        'tpl_c': ['front-template-c.jpg', 'back-template-c.jpg']
    };
    [ctx.session.templateChoice, ctx.session.backTemplateChoice] = mapping[ctx.match];
    await ctx.answerCbQuery();
    await ctx.editMessageText('Choose Photo Style:', 
        Markup.inlineKeyboard([
            [Markup.button.callback('🌈 Color', 'style_color')],
            [Markup.button.callback('⚫️ B&W', 'style_bw')]
        ])
    );
});

bot.action(['style_color', 'style_bw'], async (ctx) => {
    ctx.session.filterChoice = ctx.match === 'style_color' ? 'color' : 'bw';
    await ctx.answerCbQuery();
    
    // Save this ID to the list
    const idItem = {
        data: ctx.session.currentIdData,
        template: ctx.session.templateChoice,
        backTemplate: ctx.session.backTemplateChoice,
        filter: ctx.session.filterChoice
    };
    ctx.session.allProcessedData.push(idItem);
    
    await ctx.editMessageText(`✅ ID #${ctx.session.allProcessedData.length} Added!`, 
        Markup.inlineKeyboard([
            [Markup.button.callback('➕ Add Another ID', 'add_more')],
            [Markup.button.callback('📄 Generate Shelf (Bulk)', 'gen_shelf')],
            [Markup.button.callback('🔄 Restart All', 'restart')]
        ])
    );
});

bot.action('add_more', async (ctx) => {
    ctx.session.step = 0;
    ctx.session.images = [];
    await ctx.answerCbQuery();
    await ctx.reply('Upload **Image 1** for the next ID:');
});

bot.action('restart', async (ctx) => {
    ctx.session = { ...INITIAL_SESSION, allProcessedData: [] };
    await ctx.answerCbQuery();
    await ctx.reply('Everything cleared. Start again with **Image 1**:');
});

bot.action('gen_shelf', async (ctx) => {
    await ctx.answerCbQuery();
    if (!ctx.session.allProcessedData.length) return ctx.reply('No IDs added yet!');
    
    await ctx.reply('🚀 Generating Bulk Shelf... This may take a moment. ⏳');
    await renderShelf(ctx);
});

async function renderShelf(ctx) {
    const ids = ctx.session.allProcessedData;
    const cardWidth = 1280;
    const cardHeight = 800;
    const padding = 40;
    
    // Create a tall canvas to fit all IDs (Front and Back)
    // 2 cards per ID (Front & Back)
    const shelfCanvas = createCanvas(cardWidth + (padding * 2), (cardHeight * 2 * ids.length) + (padding * (ids.length * 2 + 1)));
    const s = shelfCanvas.getContext('2d');
    
    s.fillStyle = '#f0f0f0'; // Light gray background
    s.fillRect(0, 0, shelfCanvas.width, shelfCanvas.height);

    for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        const yOffsetFront = padding + (i * (cardHeight * 2 + padding * 2));
        const yOffsetBack = yOffsetFront + cardHeight + padding;

        // --- RENDER FRONT ON SHELF ---
        const frontBuffer = await renderSingleCard(id, true);
        const frontImg = await loadImage(frontBuffer);
        s.drawImage(frontImg, padding, yOffsetFront, cardWidth, cardHeight);

        // --- RENDER BACK ON SHELF ---
        const backBuffer = await renderSingleCard(id, false);
        const backImg = await loadImage(backBuffer);
        s.drawImage(backImg, padding, yOffsetBack, cardWidth, cardHeight);
        
        ctx.reply(`Processed ID #${i+1}/${ids.length}...`);
    }

    const finalBuffer = shelfCanvas.toBuffer('image/jpeg', { quality: 0.8 });
    await ctx.replyWithDocument({ source: finalBuffer, filename: `fayda_ids_shelf_${Date.now()}.jpg` }, { caption: `✅ Shelf with ${ids.length} IDs generated!` });
    
    ctx.reply('Use /start to begin a new batch.');
}

async function renderSingleCard(idItem, isFront) {
    const { data, template, backTemplate, filter } = idItem;
    const canvas = createCanvas(1280, 800);
    const g = canvas.getContext('2d');
    const isTemplateC = template === 'front-template-c.jpg';

    if (isFront) {
        const tpl = await loadImage(path.join(__dirname, 'public', template));
        g.drawImage(tpl, 0, 0, 1280, 800);

        // Photo
        const profilePath = data.images && (data.images[1] || data.images[0]);
        if (profilePath) {
            try {
                const img = await loadImage(getFullUrl(profilePath));
                g.save();
                g.filter = filter === 'bw' ? 'grayscale(100%)' : 'saturate(45%) brightness(100%) grayscale(74%) sepia(10%)';
                g.drawImage(img, 55, 170, 440, 540);
                g.restore();
            } catch (e) {}
        }
        // Mini
        const miniPath = data.images && data.images[0];
        if (miniPath) {
            try {
                const img = await loadImage(getFullUrl(miniPath));
                g.drawImage(img, 1030, 600, 100, 130);
            } catch (e) {}
        }
        // Barcode
        if (data.fcn_id) {
            const clean = data.fcn_id.replace(/\s/g, '');
            try {
                const bBuf = await bwipjs.toBuffer({ bcid: 'code128', text: clean, scale: 3, height: 10, backgroundcolor: 'FFFFFF' });
                const bImg = await loadImage(bBuf);
                g.fillStyle = 'white'; g.fillRect(570, 620, 400, 120);
                g.fillStyle = 'black'; g.font = 'bold 24px "Arial"'; g.textAlign = 'center';
                g.fillText(data.fcn_id, 770, 650);
                g.drawImage(bImg, 595, 660, 350, 60);
            } catch (e) {}
        }

        g.fillStyle = 'black';
        if (isTemplateC) {
            g.textAlign = 'center';
            g.font = 'bold 36px "EbrimaBold", "Arial"';
            if (data.amharic_name) g.fillText(data.amharic_name, 640, 275);
            if (data.english_name) g.fillText(data.english_name, 640, 315);
            g.font = 'bold 34px "EbrimaBold"';
            g.fillText(`${data.birth_date_ethiopian || ''} | ${data.birth_date_gregorian || ''}`, 640, 445);
            g.fillText(`${data.amharic_gender || ''} | ${data.english_gender || ''}`, 640, 530);
            g.fillText(`${data.expiry_date_ethiopian || ''} | ${data.expiry_date_gregorian || ''}`, 640, 615);
            if (data.fcn_id) { g.font='bold 32px "EbrimaBold"'; g.fillText(data.fcn_id, 640, 770); }
        } else {
            g.textAlign = 'left';
            g.font = 'bold 36px "EbrimaBold"';
            if (data.amharic_name) g.fillText(data.amharic_name, 510, 245);
            if (data.english_name) g.fillText(data.english_name, 510, 290);
            g.font = 'bold 34px "EbrimaBold"';
            g.fillText(`${data.birth_date_ethiopian || ''} | ${data.birth_date_gregorian || ''}`, 512, 408);
            g.fillText(`${data.amharic_gender || ''} | ${data.english_gender || ''}`, 512, 491);
            g.fillText(`${data.expiry_date_ethiopian || ''} | ${data.expiry_date_gregorian || ''}`, 512, 574);
            g.save(); g.translate(36, 560); g.rotate(-Math.PI/2); g.font='bold 28px "EbrimaBold"'; g.fillText(data.issue_date_ethiopian||'', 0, 0); g.restore();
            g.save(); g.translate(36, 200); g.rotate(-Math.PI/2); g.font='bold 28px "EbrimaBold"'; g.fillText(data.issue_date_gregorian||'', 0, 0); g.restore();
        }
    } else {
        const bTpl = await loadImage(path.join(__dirname, 'public', backTemplate));
        g.drawImage(bTpl, 0, 0, 1280, 800);
        const qrPath = data.images && (data.images[3] || data.images[2]);
        if (qrPath) {
            try {
                const img = await loadImage(getFullUrl(qrPath));
                g.fillStyle = 'white'; g.fillRect(576, 40, 666, 650);
                g.drawImage(img, 576, 40, 666, 650);
            } catch (e) {}
        }
        g.fillStyle = 'black'; g.textAlign = 'left'; g.font = 'bold 32px "EbrimaBold"';
        if (data.phone_number) g.fillText(data.phone_number, 45, 130);
        if (isTemplateC) {
            const nat = `${data.amharic_nationality || ''} | ${data.english_nationality || ''}`;
            g.fillText(nat, 43, 240);
        }
        g.font = 'bold 28px "EbrimaBold"';
        let curY = isTemplateC ? 335 : 320;
        if (data.amharic_city) { g.fillText(data.amharic_city, 43, curY); curY += 35; }
        if (data.english_city) { g.fillText(data.english_city, 43, curY); curY += 50; }
        if (data.amharic_sub_city) { g.fillText(data.amharic_sub_city, 43, curY); curY += 35; }
        if (data.english_sub_city) { g.fillText(data.english_sub_city, 43, curY); curY += 50; }
        if (data.amharic_woreda) { g.fillText(data.amharic_woreda, 43, curY); curY += 35; }
        if (data.english_woreda) { g.fillText(data.english_woreda, 43, curY); }
        if (data.fin_number) { g.font='bold 30px "EbrimaBold"'; g.fillText(data.fin_number, 171, 687); }
        const sn = 'S' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
        g.font='bold 28px "EbrimaBold"'; g.fillText(sn, 1070, 762);
    }
    return canvas.toBuffer('image/jpeg');
}

function getFullUrl(p) {
    if (!p) return null;
    if (p.startsWith('http')) return p;
    return `https://api.affiliate.pro.et/${p.startsWith('/') ? p.substring(1) : p}`;
}

bot.launch().then(() => console.log('Telegram Bot started with Multi-ID and Shelf support!'));
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
