let currentSession = null;

async function getLink(){
  const btn = document.getElementById("btn");
  btn.disabled = true;

  status.innerText = "⏳ Đang tạo link...";

  try {
    let res = await fetch("/getlink");
    let d = await res.json();

    if(d.link){
      currentSession = d.session;

      linkBox.innerHTML = `
        👉 Nhấn để vượt:<br><br>
        <a href="${d.link}" target="_blank" onclick="verify()">VƯỢT LINK</a>
        <br><br>
        ⏳ Chờ 15 giây rồi quay lại bấm nhận key
        <br><br>
        <button onclick="getKey()">Nhận Key</button>
      `;

      status.innerText = "✅ Link đã sẵn sàng!";
    } else {
      status.innerText = d.error;
    }
  } catch {
    status.innerText = "❌ Lỗi server!";
  }

  setTimeout(() => btn.disabled = false, 3000);
}

function verify(){
  fetch("/verify?session=" + currentSession);
}

async function getKey(){
  let res = await fetch("/getkey?session=" + currentSession);
  let d = await res.json();

  if(d.key){
    keyBox.innerText = "🎉 " + d.key;
  } else {
    alert(d.error);
  }
}