(() => {
  'use strict';
  const form = document.getElementById('inquiryForm');
  if (!form) return;
  const name = document.getElementById('inquiryName');
  const email = document.getElementById('inquiryEmail');
  const message = document.getElementById('inquiryMessage');
  const time = document.getElementById('inquiryTime');
  const services = [...form.querySelectorAll('input[name="services"]')];
  const status = document.getElementById('inquiryStatus');
  const send = document.getElementById('prepareInquiry');
  const copy = document.getElementById('copyInquiry');
  send.hidden = false;
  copy.hidden = false;
  function validateServices() {
    services[0].setCustomValidity(services.some(item => item.checked) ? '' : '請至少選擇一項需求。');
  }
  services.forEach(item => item.addEventListener('change', validateServices));
  validateServices();
  [name, message].forEach(field => field.addEventListener('input', () => field.setCustomValidity('')));
  function getInquiry() {
    validateServices();
    name.setCustomValidity(name.value.trim() ? '' : '請輸入您的姓名或稱呼。');
    message.setCustomValidity(message.value.trim() ? '' : '請輸入需求簡介。');
    if (!form.reportValidity()) return null;
    const displayName = name.value.trim().replace(/[\r\n]+/g, ' ');
    const subject = '網站需求洽詢｜' + displayName.slice(0, 50);
    const body = [
      '通航國際 您好：', '',
      '姓名／稱呼：' + displayName,
      '聯絡電子信箱：' + email.value.trim(),
      '您的需求：' + services.filter(item => item.checked).map(item => item.value).join('、'),
      '適合聯絡的時間：' + time.value, '',
      '需求簡介：', message.value.trim(), '',
      '此內容由通航網站聯絡表單整理。'
    ].join('\r\n');
    return {subject, body};
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    const inquiry = getInquiry();
    if (!inquiry) return;
    const url = 'mailto:service@tonnet.com.tw?subject=' + encodeURIComponent(inquiry.subject) + '&body=' + encodeURIComponent(inquiry.body);
    try {
      window.location.assign(url);
      status.textContent = '已嘗試開啟郵件程式。請確認內容後寄出；若未開啟或內容不完整，可複製需求內容，或使用 Google 表單。';
    } catch {
      status.textContent = '無法開啟郵件程式，請複製需求內容寄至 service@tonnet.com.tw，或使用 Google 表單。';
    }
  });
  copy.addEventListener('click', async () => {
    const inquiry = getInquiry();
    if (!inquiry) return;
    const text = '收件人：service@tonnet.com.tw\r\n主旨：' + inquiry.subject + '\r\n\r\n' + inquiry.body;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      status.textContent = '需求內容已複製，請貼到電子郵件中，確認後寄至 service@tonnet.com.tw。';
    } catch {
      let area = document.getElementById('inquiryCopyText');
      if (!area) {
        area = document.createElement('textarea');
        area.id = 'inquiryCopyText';
        area.className = 'inquiry-copy-text';
        area.readOnly = true;
        area.rows = 8;
        area.setAttribute('aria-label', '請複製以下需求內容');
        form.append(area);
      }
      area.value = text;
      area.focus();
      area.select();
      status.textContent = '請複製下方文字，貼到電子郵件中，確認後寄至 service@tonnet.com.tw。';
    }
  });
})();
