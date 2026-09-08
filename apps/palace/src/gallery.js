import {catalog} from './catalog.js';
import './gallery.css';

const el=(tag,text,className)=>{
  const node=document.createElement(tag);
  if(text) node.textContent=text;
  if(className) node.className=className;
  return node;
};
const link=(text,href,className)=>{const a=el('a',text,className);a.href=href;return a;};
document.title='Haasome — places to learn and remember';
document.body.className='gallery';
const header=el('header');
header.append(link('haasome','?gallery','brand'),link('Open a saved palace / import','./','workspace-link'));
const main=el('main');
main.append(el('p','THE SPATIAL LIBRARY','eyebrow'),el('h1','Give knowledge a place.'),el('p','Explore an object. Recover its story. Return and see what you remember.','intro'));
const ready=catalog[0], feature=el('article',null,'feature');
feature.setAttribute('aria-label',ready.title);
const cover=el('div',null,'type-cover');
cover.append(el('p','ROME / CAPITOLINE COURTYARD','eyebrow'),el('p','Head.\nHand.\nFoot.','fragments'),el('p','Three fragments. One emperor.','cover-caption'));
const content=el('div',null,'feature-content');
content.append(el('span','Ready','status ready'),el('h2',ready.title),el('p',ready.promise),el('p',`${ready.origin} · ${ready.attachment}`,'metadata'),el('p','Three museum notes · Surface selection · Recall · Portable capsule','metadata'),link('Explore →',`?tour=${ready.id}`,'explore'),el('p',ready.credit,'credit'),link('Scene source & license ↗',ready.source,'source-link'));
feature.append(cover,content);main.append(feature);
const proposals=el('section',null,'proposals');
proposals.setAttribute('aria-labelledby','proposal-title');
const heading=el('h2','Where could we go next?');heading.id='proposal-title';
proposals.append(heading,el('p','Proposals, not playable tours. These listings still need asset, identity or rights checks. No candidate scenes load here.','intro'));
const grid=el('div',null,'proposal-grid');
for(const entry of catalog.slice(1)) {
  const card=el('article',null,'proposal');card.dataset.candidate=entry.id;
  card.append(el('span',entry.status,'status'),el('p',entry.place,'eyebrow'),el('h3',entry.title),el('p',entry.promise),el('p',entry.origin,'metadata'),el('p',entry.attachment,'metadata'));
  const details=el('details');
  details.append(el('summary','View proposal'),el('p',entry.context),el('strong','Before this can become Ready'),el('p',entry.gate),link('Review source listing ↗',entry.source,'source-link'));
  card.append(details);grid.append(card);
}
proposals.append(grid);main.append(proposals);
const footer=el('footer');
footer.append(el('p','One ready place. More only when the evidence travels with them.'),el('p','Private capture experiments stay in your local workspace. The gallery does not read or replace saved palaces.'),link('Open a saved palace / import','./'));
document.body.append(header,main,footer);document.body.hidden=false;
