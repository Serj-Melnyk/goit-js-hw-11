import SimpleLightbox from 'simplelightbox';
import Notiflix from 'notiflix';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchApi } from './fetch';

const formInput = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const guard = document.querySelector('#scrollArea');
const btnSum = document.querySelector('.form__btn');
const btnDelletResult = document.querySelector('.btn__dellet');
const menuStory = document.querySelector('.history');
const modalCont = document.querySelector('.modal');
const body = document.querySelector('body');

btnDelletResult.addEventListener('click', onClick);
btnSum.addEventListener('click', onSubmit);
formInput.addEventListener('input', onInput);

btnSum.setAttribute('disabled', true);
btnDelletResult.style.display = 'none';

let page = 1;
let numberStory = 1;

if (!localStorage.getItem(numberStory) === null) {
  numberStory = localStorage.getItem(numberStory);
}

let options = {
  root: null,
  rootMargin: '300px',
  threshold: 0.7,
};

let observer = new IntersectionObserver(onLoad, options);

function onInput() {
  btnSum.setAttribute('disabled', true);
  if (auditNullInput()) {
    btnSum.removeAttribute('disabled');
  }
}
function auditNullInput() {
  const a = [...formInput[0].value];
  let truFal = true;
  if (a.length === 0) {
    truFal = false;
  }
  a.forEach(element => {
    if (element === ' ') {
      truFal = false;
    } else {
      truFal = true;
    }
  });
  return truFal;
}

function onLoad(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      importElm();
    }
  });
}
function onClick(evt) {
  evt.preventDefault();
  btnSum.setAttribute('disabled', true);
  if (observer) {
    observer.disconnect();
  }
  zeroing();
  btnDelletResult.style.display = 'none';

  formInput.children.namedItem('searchQuery').value = '';

  Notiflix.Notify.success('result deleted.');
}

function onSubmit(evt) {
  evt.preventDefault();
  menuStory.classList.add('visually-hidden');
  body.classList.remove('noScroll');
  modalCont.classList.add('visually-hidden');
  if (observer) {
    observer.disconnect();
  }
  zeroing();
  importElm();
  btnDelletResult.style.display = 'block';
}

export function zeroing() {
  gallery.innerHTML = '';
  page = 1;
}

function importElm() {
  const textSearchs = formInput[0].value;

  fetchApi(textSearchs, page)
    .then(result => {
      if (result.totalHits === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        throw new Error(response.status);
      }
      creatE(result, textSearchs);
    })

    .catch(err => {
      console.log(err);
    });
}

function setLocalStory(textSearchs) {
  if (!auditSetItemLocal(textSearchs)) {
    localStorage.setItem(`numberStory`, numberStory);
    localStorage.setItem(`story${numberStory}`, textSearchs);
    if (numberStory >= 10) {
      numberStory = 0;
    }
    numberStory++;
  }
}

function auditSetItemLocal(textSearchs) {
  let truFal = false;
  for (let i = 0; i < 10; i++) {
    if (localStorage.getItem(`story${i}`) === textSearchs) {
      return true;
    }
  }
  return truFal;
}

function creatE(objImages, textSearchs) {
  setLocalStory(textSearchs);
  console.log(textSearchs);
  if (objImages.hits[0] === undefined) {
    Notiflix.Notify.failure(
      "We're sorry, but you've reached the end of search results."
    );
    if (observer) {
      observer.disconnect();
    }

    return;
  }

  if (page === 1) {
    Notiflix.Notify.success(`Hooray! We found ${objImages.totalHits} images.`);
    creatElmHtml(objImages);
    return;
  }
  creatElmHtml(objImages);
}

function addElmHtml(arr, objImages) {
  gallery.insertAdjacentHTML('beforeend', arr);
  lightbox();
  page++;

  if (objImages.totalHits > 40) {
    observer.observe(guard);
  }
}

function lightbox() {
  const lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
    overlayOpacity: 0.7,
  });
}
function creatElmHtml(objImages) {
  const arrObjElm = objImages.hits;

  const markup = [];

  arrObjElm.map(element =>
    markup.push(
      `<a class="gallery__item" onclick="event.preventDefault()"
     href="${element.largeImageURL}">
     <div class="photo-card">
      <img src="${element.webformatURL}" alt="${element.tags}" loading="lazy"/>
      <div class="info">
        <p class="info-item">
          <b>Likes</b>
      ${element.likes}
        </p>
        <p class="info-item">
          <b>Views</b>
      ${element.views}
        </p>
        <p class="info-item">
          <b>Comments</b>
    ${element.comments}
        </p>
        <p class="info-item">
          <b>Downloads</b>
    ${element.downloads}
        </p>
      </div>
    </div>
    </a>`
    )
  );

  addElmHtml(markup.join(' '), objImages);
}
