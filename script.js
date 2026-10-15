'use strict';
// Фотографии конкретных моделей: Wikimedia Commons, CC BY 2.0 или CC BY-SA 4.0.
// Сперва загружаются локальные HD-файлы. Если их ещё нет — версии 960–1280px онлайн,
// загружаемые в один клик через ЗАГРУЗИТЬ_ФОТО.bat. Старые миниатюры — последняя запасная копия.
const photoSources = {
  "iphone13-box": {
    "local": "iphone13-box.jpg",
    "fallback": "iphone13.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2b/IPhone_13_for_Tora_%2852641558635%29.jpg/1280px-IPhone_13_for_Tora_%2852641558635%29.jpg",
    "orientation": "landscape",
    "name": "iPhone 13, задняя панель на коробке",
    "author": "Tatsuo Yamashita",
    "page": "https://commons.wikimedia.org/wiki/File:IPhone_13_for_Tora_(52641558635).jpg"
  },
  "iphone13-white": {
    "local": "iphone13-white.jpg",
    "fallback": "iphone13.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3c/IPhone_13.jpg/960px-IPhone_13.jpg",
    "orientation": "portrait",
    "name": "iPhone 13 белый, задняя панель",
    "author": "Kskhh",
    "page": "https://commons.wikimedia.org/wiki/File:IPhone_13.jpg"
  },
  "iphone12-green": {
    "local": "iphone12-green.jpg",
    "fallback": "iphone12.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5a/IPhone_12_Green_128g.jpg/960px-IPhone_12_Green_128g.jpg",
    "orientation": "portrait",
    "name": "iPhone 12 зелёный, вид сзади",
    "author": "茅野ふたば",
    "page": "https://commons.wikimedia.org/wiki/File:IPhone_12_Green_128g.jpg"
  },
  "iphone12-red": {
    "local": "iphone12-red.png",
    "fallback": "iphone12.jpg",
    "url": "https://upload.wikimedia.org/wikipedia/commons/b/ba/Iphone-12-product--red.png",
    "orientation": "portrait",
    "name": "iPhone 12 PRODUCT(RED), вид спереди",
    "author": "Raphaël Poupon",
    "page": "https://commons.wikimedia.org/wiki/File:Iphone-12-product--red.png"
  },
  "s22-back": {
    "local": "s22-back.jpg",
    "fallback": "galaxys22.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/Back_of_the_Samsung_Galaxy_S22.jpg/960px-Back_of_the_Samsung_Galaxy_S22.jpg",
    "orientation": "portrait",
    "name": "Samsung Galaxy S22 розовый, вид сзади",
    "author": "Hajoon0102",
    "page": "https://commons.wikimedia.org/wiki/File:Back_of_the_Samsung_Galaxy_S22.jpg"
  },
  "redmi-back": {
    "local": "redmi-back.jpg",
    "fallback": "redminote12.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f4/Redmi_Note_12_back.jpg/960px-Redmi_Note_12_back.jpg",
    "orientation": "portrait",
    "name": "Xiaomi Redmi Note 12 синий, вид сзади",
    "author": "Maksdroider",
    "page": "https://commons.wikimedia.org/wiki/File:Redmi_Note_12_back.jpg"
  },
  "redmi-front": {
    "local": "redmi-front.jpg",
    "fallback": "redminote12.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/be/Redmi_Note_12_front.jpg/960px-Redmi_Note_12_front.jpg",
    "orientation": "portrait",
    "name": "Xiaomi Redmi Note 12, экран",
    "author": "Maksdroider",
    "page": "https://commons.wikimedia.org/wiki/File:Redmi_Note_12_front.jpg"
  }
};
const items = [
  {id:1, brand:'Apple', name:'iPhone 13', storage:'128 ГБ', type:'used', condition:'good', price:24900, photo:'iphone13.jpg', photoKey:'iphone13-box'},
  {id:2, brand:'Apple', name:'iPhone 13', storage:'256 ГБ', type:'used', condition:'excellent', price:29900, photo:'iphone13.jpg', photoKey:'iphone13-white'},
  {id:3, brand:'Apple', name:'iPhone 12', storage:'128 ГБ', type:'used', condition:'good', price:19800, photo:'iphone12.jpg', photoKey:'iphone12-green'},
  {id:4, brand:'Samsung', name:'Galaxy S22', storage:'128 ГБ', type:'used', condition:'excellent', price:23800, photo:'galaxys22.jpg', photoKey:'s22-back'},
  {id:5, brand:'Samsung', name:'Galaxy S22', storage:'256 ГБ', type:'new', condition:'new', price:36500, photo:'galaxys22.jpg', photoKey:'s22-back'},
  {id:6, brand:'Xiaomi', name:'Redmi Note 12', storage:'128 ГБ', type:'new', condition:'new', price:15900, photo:'redminote12.jpg', photoKey:'redmi-front'},
  {id:7, brand:'Xiaomi', name:'Redmi Note 12', storage:'256 ГБ', type:'used', condition:'excellent', price:11400, photo:'redminote12.jpg', photoKey:'redmi-back'},
  {id:8, brand:'Apple', name:'iPhone 12', storage:'128 ГБ', type:'new', condition:'new', price:31900, photo:'iphone12.jpg', photoKey:'iphone12-green'}
];
const labelCondition={good:'Хорошее',excellent:'Отличное',new:'Новое'};
const state={type:'all',brand:'all',condition:'all',price:'all'};
const grid=document.getElementById('productGrid');
const count=document.getElementById('count');
const resultText=document.getElementById('resultText');
const empty=document.getElementById('emptyState');
const formatPrice=(n)=>new Intl.NumberFormat('ru-RU').format(n)+' сом';
function attachPhotoFallback(img, photo){
  // Без внешней сети сначала используется заранее скачанная HD-фотография.
  // Крошечный старый снимок — только аварийный резерв для полностью автономного открытия.
  const fallbackPaths=['assets/images/hd/'+photo.local,'assets/images/'+photo.fallback];
  let fallbackIndex=0;
  img.addEventListener('error',()=>{
    if(fallbackIndex<fallbackPaths.length){img.src=fallbackPaths[fallbackIndex++];if(fallbackIndex===fallbackPaths.length)img.classList.add('lowres-fallback');}
  });
}
function render(){
  const filtered=items.filter(item => (state.type==='all'||state.type===item.type) && (state.brand==='all'||state.brand===item.brand) && (state.condition==='all'||state.condition===item.condition) && (state.price==='all'||item.price<=Number(state.price)));
  grid.replaceChildren();
  for(const item of filtered){
    const article=document.createElement('article');article.className='product';
    const status=item.type==='new'?'НОВЫЙ':'Б/У';
    const photo=photoSources[item.photoKey];
    article.innerHTML=`<div class="product-picture ${photo.orientation==='landscape'?'landscape':''}"><img src="assets/images/hd/${photo.local}" width="480" height="640" loading="lazy" decoding="async" alt="${photo.name}"><span class="product-tag ${item.type}">${status}</span></div><div class="product-info"><span class="product-brand">${item.brand.toUpperCase()}</span><h3 class="product-title">${item.name}</h3><p class="product-specs">${item.storage} · ${labelCondition[item.condition]}</p><div class="product-bottom"><span class="product-price">${formatPrice(item.price)}</span><small>Пример цены</small></div></div>`;
    attachPhotoFallback(article.querySelector('.product-picture img'),photo);
    grid.append(article);
  }
  count.textContent=String(filtered.length);
  resultText.textContent=`Показано: ${filtered.length} из ${items.length} позиций`;
  empty.hidden=filtered.length!==0;
}
function reset(){
  Object.assign(state,{type:'all',brand:'all',condition:'all',price:'all'});
  document.querySelectorAll('.tabs .tab').forEach(button=>{const active=button.dataset.type==='all';button.classList.toggle('is-active',active);button.setAttribute('aria-pressed',String(active));});
  for(const id of ['brandFilter','conditionFilter','priceFilter'])document.getElementById(id).value='all';
  render();
}
document.querySelectorAll('.tab').forEach(button=>button.addEventListener('click',()=>{
  state.type=button.dataset.type;
  document.querySelectorAll('.tab').forEach(b=>{const active=b===button;b.classList.toggle('is-active',active);b.setAttribute('aria-pressed',String(active));});
  render();
}));
for(const [id,key] of [['brandFilter','brand'],['conditionFilter','condition'],['priceFilter','price']]){
  document.getElementById(id).addEventListener('change',event=>{state[key]=event.target.value;render();});
}
document.getElementById('resetFilters').addEventListener('click',reset);
document.getElementById('emptyReset').addEventListener('click',reset);
const heroPhone=document.getElementById('heroPhone');
if(heroPhone){let tries=0;heroPhone.addEventListener('error',()=>{const paths=['assets/images/hd/iphone13-box.jpg','assets/images/iphone13.jpg'];if(tries<paths.length)heroPhone.src=paths[tries++];});}
const menuToggle=document.getElementById('menuToggle'),nav=document.getElementById('primaryNav');
menuToggle.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');menuToggle.setAttribute('aria-expanded',String(open));menuToggle.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('is-open');menuToggle.setAttribute('aria-expanded','false');menuToggle.setAttribute('aria-label','Открыть меню');}));
const form=document.getElementById('valuationForm'),error=document.getElementById('formError'),preview=document.getElementById('requestPreview');
const fields=['phoneModel','storage','screenState','bodyState','packageState','contact'];
const requestText=document.getElementById('requestText');
function visibleError(message,field){error.textContent=message;error.hidden=false;if(field){field.setAttribute('aria-invalid','true');field.focus();}preview.hidden=true;}
form.addEventListener('input',event=>{if(event.target.matches('input, select')){event.target.removeAttribute('aria-invalid');error.hidden=true;}});
form.addEventListener('change',event=>{if(event.target.matches('select')){event.target.removeAttribute('aria-invalid');error.hidden=true;}});
form.addEventListener('submit',event=>{
  event.preventDefault();
  for(const id of fields){const el=document.getElementById(id);if(!el.value.trim()){visibleError('Пожалуйста, заполните обязательное поле: '+el.closest('label').textContent.trim().split('*')[0].trim(),el);return;}}
  const model=document.getElementById('phoneModel').value.trim();const contact=document.getElementById('contact').value.trim();
  if(model.length<2){visibleError('Название модели должно содержать не менее 2 символов.',document.getElementById('phoneModel'));return;}
  if(contact.length<4 || (!/[\d@a-zA-Zа-яА-Я]/.test(contact))){visibleError('Введите понятный контакт: номер телефона или @username.',document.getElementById('contact'));return;}
  error.hidden=true;
  requestText.textContent=['ПРЕДВАРИТЕЛЬНАЯ ЗАЯВКА RE','Модель: '+model,'Память: '+document.getElementById('storage').value,'Экран: '+document.getElementById('screenState').value,'Корпус: '+document.getElementById('bodyState').value,'Комплект: '+document.getElementById('packageState').value,'Контакт: '+contact,'','Цена определяется после проверки.','Заявка сформирована локально; отправки не было.'].join('\n');
  preview.hidden=false;document.getElementById('copyStatus').textContent='';
  preview.scrollIntoView({block:'nearest',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
});
document.getElementById('copyRequest').addEventListener('click',async()=>{
  const status=document.getElementById('copyStatus');
  try{await navigator.clipboard.writeText(requestText.textContent);status.textContent='Скопировано';}
  catch{status.textContent='Автокопирование недоступно. Выделите текст выше и скопируйте вручную.';}
});
render();
