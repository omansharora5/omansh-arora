# Omansh Arora's portfolio

Static HTML, CSS, and JavaScript. There is no build step or production dependency.

Run a local preview from this directory:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Open `http://127.0.0.1:4173`. Production is https://pp-website-seven.vercel.app and deploys the repository root from `main`. The repository is https://github.com/omansharora5/omansh-arora.

Run the portable resource and fragment-link checks with `node --test tests/site.test.cjs`. Browser verification also covered all nine pages at 375, 768, 1024, and 1440 pixels, event links from both sections, dial navigation, motion preferences, keyboard process selection, the Meta image dialog, and existing video metadata. External services and the pending VDMA images are outside those checks. The public production deployment was verified on 1 November 2026 using the browser checks described above. The manual motion button is absent, old saved pause settings are ignored, and the site title is Omansh Arora. Preview deployments may require the owner's Vercel sign-in.

## Pages

- `index.html`: portfolio, research index, hackathons, projects, experience, certificates, and education.
- `grandhack.html`: GrandHack at IPEC, VDMA project overview and gallery.
- `binary-hack.html`: Binary Hack at RKGIT, VDMA project overview and gallery.
- `meta-open-env.html`: existing Fab Yield Agent story, local demo video, and four event photographs.
- `research/`: five white research notes with selectable process steps.

The interface adapts the user's Blockit reference: grey surfaces, white displays, rounded control groups, orange indicators, and a section dial. The dial follows the active section. Its arrow buttons provide the same navigation without a mouse wheel. Motion follows the operating system's reduced-motion setting. There is no manual motion button.

## Add the VDMA event photos

The two event pages intentionally contain dashed placeholders. No certificate or trophy image has been supplied yet. Keep the events' photos separate.

1. Put supplied photos under `images/grandhack/` or `images/binary-hack/`.
2. Replace the appropriate `<figure class="gallery-slot">` with a figure containing the real image and a caption. Give the image descriptive alt text, its actual pixel dimensions, and `loading="lazy"`.
3. Check both the phone and desktop layouts. Do not reuse the existing Meta event photos for these events.

Example structure, after the actual file exists:

```html
<figure class="event-photo">
  <img src="images/grandhack/certificate.jpg"
       alt="Omansh Arora's GrandHack winner certificate from IPEC"
       width="1600" height="1200" loading="lazy">
  <figcaption>GrandHack at IPEC, winner certificate.</figcaption>
</figure>
```

VDMA source links are intentionally absent. Its repository stays private while the team develops the project for a possible startup launch.

## Research content

The Q-MDM and memory notes summarize the existing project records. Quantum-inspired retrieval is a classical numerical simulation, with no demonstrated quality advantage in the recorded synthetic comparison. Creative speculation and the general manufacturing harness are early research directions. The semiconductor gym is a simulated hackathon prototype. The notes describe proposed experiments separately from implemented behavior; they make no claims of published papers, institutional affiliation, or real-factory validation.

The certificate and experience entries retain the owner's existing portfolio record. The new GrandHack and Binary Hack names and wins use the owner's corrections. Exact event dates and event-specific VDMA changes still need the owner's event records.
