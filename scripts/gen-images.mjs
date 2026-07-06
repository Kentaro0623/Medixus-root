/**
 * gpt-image-2 で Medixus Clinic の一人称POV / 三人称の写実画像を生成する。
 *   node --env-file=.env scripts/gen-images.mjs           # 全枚数
 *   node --env-file=.env scripts/gen-images.mjs pov-01    # id指定
 * 出力: public/photos/<id>.png
 */

import fs from 'node:fs';
import path from 'node:path';

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error('OPENAI_API_KEY is not set (use: node --env-file=.env ...)');
  process.exit(1);
}

const OUT_DIR = path.join(process.cwd(), 'public', 'photos');

const STYLE = `Photorealistic photograph, 35mm lens, natural soft daylight, shallow depth of field, high-end architectural/lifestyle photography.
Setting: "Medixus Clinic", a modern Japanese smart clinic — warm white walls, pale oak wood, soft sage-green plants, deep teal (#0F766E) brand accents and signage, extremely clean, minimal and calm.
People are Japanese. Avoid any readable text except a small "Medixus Clinic" logo where natural; UI screens show only clean teal abstract interfaces. No watermarks.`;

const POV = `First-person point of view from the patient's own eyes, natural eye-level perspective; the patient's own hands visible where natural.`;

const IMAGES = [
  {
    id: 'pov-01-intake',
    prompt: `${STYLE}\n${POV}\nScene: sitting on a sofa at home in the morning, holding a smartphone with both hands; the screen shows a clean teal medical chat interface with a large QR code card; soft window light, a cup of tea on the table.`,
  },
  {
    id: 'pov-02-entrance',
    prompt: `${STYLE}\n${POV}\nScene: walking toward the glass automatic sliding doors of a small modern clinic on a quiet Japanese street in the morning; teal "Medixus Clinic" sign above the entrance; warm light from inside.`,
  },
  {
    id: 'pov-03-kiosk',
    prompt: `${STYLE}\n${POV}\nScene: own right hand holding a smartphone showing a QR code, holding it up to a sleek self check-in kiosk terminal with a teal screen; bright unmanned reception area behind, no staff at any counter.`,
  },
  {
    id: 'pov-04-waiting',
    prompt: `${STYLE}\n${POV}\nScene: seated in a calm waiting area with light wood chairs and green plants, looking toward a wall display board showing large queue numbers on a dark teal screen; one or two other patients waiting at a distance, relaxed.`,
  },
  {
    id: 'pov-05-doctor',
    prompt: `${STYLE}\n${POV}\nScene: sitting in a consultation room across a light wooden desk from a friendly Japanese male doctor in a white coat, who looks directly at the camera (at you) with warm eye contact while talking; no keyboard or paperwork between you; a slim monitor angled to the side.`,
  },
  {
    id: 'pov-06-matching',
    prompt: `${STYLE}\n${POV}\nScene: in the same consultation room, now looking at a large wall-mounted monitor beside the desk; on the video-call screen a remote specialist — a Japanese female doctor in a white coat — appears and smiles; the in-room doctor gestures toward the screen introducing her; subtle teal video-call UI frame around her.`,
  },
  {
    id: 'pov-07-pay',
    prompt: `${STYLE}\n${POV}\nScene: walking along the clinic exit corridor, passing a self-payment kiosk machine WITHOUT stopping; own hand holding a smartphone that shows a teal "payment complete" screen with a large white checkmark; exit doors ahead with daylight.`,
  },
  {
    id: 'pov-08-pharmacy',
    prompt: `${STYLE}\n${POV}\nScene: standing at a bright pharmacy counter next door to the clinic; a smiling Japanese pharmacist in a white coat hands over a small white paper medicine bag across the light wooden counter.`,
  },
  {
    id: 'pov-09-revisit',
    prompt: `${STYLE}\n${POV}\nScene: back in the same consultation room one week later; the same friendly Japanese male doctor in a white coat smiles warmly at the camera (at you) with a reassuring, pleased expression, sitting relaxed at the light wooden desk with a slim monitor angled aside; bright morning light, calm and happy mood of recovery.`,
  },
  {
    id: 'tp-01-exterior',
    prompt: `${STYLE}\nThird-person wide shot: street view of a small modern one-story clinic with large glass windows, warm light glowing from inside at dusk; teal "Medixus Clinic" signage; a small pharmacy visible next door; quiet Japanese neighborhood street with a tree.`,
  },
  {
    id: 'tp-02-reception',
    prompt: `${STYLE}\nThird-person wide shot: the unmanned entrance area of the clinic — no reception desk staff at all, only two sleek self check-in kiosk terminals with teal screens; one patient checking in with a smartphone; morning light, plants, calm.`,
  },
  {
    id: 'tp-03-matching',
    prompt: `${STYLE}\nThird-person over-the-shoulder wide shot inside the consultation room: a patient and the in-room physician sit side by side, both looking at a large wall screen where a remote specialist doctor appears via video call and greets them; warm modern interior, subtle teal UI accents on the screen.`,
  },
  {
    id: 'tp-04-doctor-remote',
    prompt: `${STYLE}\nThird-person shot: a Japanese female doctor in a bright, stylish home office joining a clinic consultation remotely — laptop and external monitor showing a teal telemedicine interface with a patient consultation room on screen; white coat over casual clothes, cup of coffee, relaxed professional atmosphere, flexible modern way of working.`,
  },
];

async function generate(img) {
  const body = {
    model: 'gpt-5.5',
    input: img.prompt,
    tools: [{ type: 'image_generation', size: '1536x1024', quality: 'high' }],
  };
  let res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    // tool側パラメータ非対応の可能性 → 素のツール指定でリトライ
    if (res.status === 400) {
      console.warn(`  [${img.id}] 400 with sized tool, retrying with bare tool… (${errText.slice(0, 200)})`);
      res = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({ ...body, tools: [{ type: 'image_generation' }] }),
      });
    }
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 500)}`);
    }
  }
  const json = await res.json();
  const calls = (json.output ?? []).filter((o) => o.type === 'image_generation_call');
  const b64 = calls.map((o) => o.result).find(Boolean);
  if (!b64) {
    throw new Error(`no image in response: ${JSON.stringify(json).slice(0, 400)}`);
  }
  const file = path.join(OUT_DIR, `${img.id}.png`);
  fs.writeFileSync(file, Buffer.from(b64, 'base64'));
  const kb = Math.round(fs.statSync(file).size / 1024);
  console.log(`  [${img.id}] saved ${kb}KB -> ${path.relative(process.cwd(), file)}`);
}

const only = process.argv[2];
const targets = only ? IMAGES.filter((i) => i.id.startsWith(only)) : IMAGES;
if (targets.length === 0) {
  console.error(`no image matches "${only}"`);
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
console.log(`generating ${targets.length} image(s)…`);
for (const img of targets) {
  const t0 = Date.now();
  try {
    await generate(img);
    console.log(`  [${img.id}] done in ${Math.round((Date.now() - t0) / 1000)}s`);
  } catch (e) {
    console.error(`  [${img.id}] FAILED: ${e.message}`);
  }
}
console.log('done.');
