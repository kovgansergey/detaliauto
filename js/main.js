'use strict';

const guidePopup = document.querySelector('.guide-popup'),
  consultationPopup = document.querySelector('.consultation-popup');

// функция открытия-закрытия модального окна Guide
function openGuidePopup() {
  // анимация появления модального окна
  function popupAnimate(popup) {
    let coin = 0;
    requestAnimationFrame(function popupAnim() {
      popup.style.opacity = coin / 100;

      if (coin < 100) {
        coin += 3;
        requestAnimationFrame(popupAnim);
      } else {
        popup.style.opacity = '';
      }
    });
  }

  function closeGuidePopup(event) {
    if (event.target.closest('.guide-popup_close') || !event.target.closest('.guide-popup_dialog')) {
      guidePopup.style.display = '';
      guidePopup.removeEventListener('click', closeGuidePopup);
    }
  }

  guidePopup.style.display = 'flex';
  popupAnimate(guidePopup);
  guidePopup.addEventListener('click', closeGuidePopup);
}

// функция открытия модального окна Консультации
function openConsultationPopup() {
  // анимация появления модального окна
  function popupAnimate(popup) {
    let coin = 100;
    requestAnimationFrame(function popupAnim() {
      popup.style.bottom = coin + '%';

      if (coin > 0) {
        coin -= 5;
        requestAnimationFrame(popupAnim);
      } else {
        popup.style.bottom = '';
      }
    });
  }

  consultationPopup.classList.add('active');
  popupAnimate(consultationPopup);
}

// маска для ввода телефона
function maskPhone(selector, masked = '+7 (___) ___ - __ - __') {
  const elems = document.querySelectorAll(selector);

  function mask(event) {
    const keyCode = event.keyCode;
    const template = masked,
      def = template.replace(/\D/g, ""),
      val = this.value.replace(/\D/g, "");
    let i = 0,
      newValue = template.replace(/[_\d]/g, function (a) {
        return i < val.length ? val.charAt(i++) || def.charAt(i) : a;
      });
    i = newValue.indexOf("_");
    if (i != -1) {
      newValue = newValue.slice(0, i);
    }
    let reg = template.substr(0, this.value.length).replace(/_+/g,
      function (a) {
        return "\\d{1," + a.length + "}";
      }).replace(/[+()]/g, "\\$&");
    reg = new RegExp("^" + reg + "$");
    if (!reg.test(this.value) || this.value.length < 5 || keyCode > 47 && keyCode < 58) {
      this.value = newValue;
    }
    if (event.type == "blur" && this.value.length < 5) {
      this.value = "";
    }

  }

  for (const elem of elems) {
    elem.addEventListener("input", mask);
    elem.addEventListener("focus", mask);
    elem.addEventListener("blur", mask);
  }

}

// отправка форм
function sendForm(formID) {
  const errorMessage = 'Что-то пошло не так...';
  const loadMessage = 'Загрузка...';
  const successMessage = 'Спасибо! Мы скоро с вами свяжемся!';

  const form = document.getElementById(formID);
  const statusMessage = document.createElement('div');
  statusMessage.style.cssText = `width: 100%; font-size: 16px; text-align: center;
    position: absolute; left: 0; bottom: 5px`;

  form.addEventListener('input', event => {
    const target = event.target;

    if (target.name === 'user_name') {
      target.value = target.value.replace(/[^а-яё\s]/i, '');
    }
  });

  function clearInputs() {
    const formInputs = form.querySelectorAll('input');

    formInputs.forEach(item => {
      item.value = '';
      item.style.outline = 'none';
      item.style.boxShadow = 'none';
    });
  }

  function postData(body, outputData, errorData) {
    const request = new XMLHttpRequest();

    request.addEventListener('readystatechange', () => {

      if (request.readyState !== 4) {
        return;
      }

      if (request.status === 200) {
        outputData();
        clearInputs();
      } else {
        errorData(request.status);
      }
    });

    request.open('POST', './php/server.php');
    request.setRequestHeader('Content-Type', 'multipart/form-data');
    request.send(body);
  }

  form.addEventListener('submit', event => {
    event.preventDefault();

    const phoneInput = form.querySelector('.phone-user');
    if (phoneInput.value.length !== 22) {
      phoneInput.style.border = '1px solid red';
      return;
    } else {
      phoneInput.style.border = '';
    }

    form.append(statusMessage);
    statusMessage.textContent = loadMessage;
    const formData = new FormData(form);

    postData(formData,
      () => {
        statusMessage.textContent = successMessage;
      },
      (error) => {
        statusMessage.textContent = errorMessage;
        console.error(error);
      });
  });
}

maskPhone('.phone-user');
sendForm('form1');
sendForm('form2');

document.addEventListener('click', event => {
  const target = event.target;

  // при клике на кнопку заказа guide - открытие модального окна
  if (target.classList.contains('guide_btn')) {
    openGuidePopup();
  }
  
  // отключение перехода по пустой ссылке "заказать звонок"
  if (target.classList.contains('call')) {
    event.preventDefault();
  }

  // при клике на кнопки консультации - открытие модального окна
  if (target.classList.contains('consultation-btn') && !consultationPopup.classList.contains('active')) {
    openConsultationPopup();
  }

  if (consultationPopup.classList.contains('active') && !target.closest('.consultation-popup') && !target.classList.contains('consultation-btn')) {
    consultationPopup.classList.remove('active');
  }
});