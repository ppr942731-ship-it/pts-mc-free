let viewer;
let poses = [];
let selectedPose = null;
let skinLoaded = false;

const canvas = document.getElementById('skinCanvas');
const poseList = document.getElementById('poseList');
const skinInput = document.getElementById('skinInput');
const skinStatus = document.getElementById('skinStatus');
const downloadBtn = document.getElementById('downloadBtn');

// === INISIALISASI ===
async function init() {
  // Muat daftar pose dari JSON
  const res = await fetch('presets.json');
  const data = await res.json();
  poses = data.poses;

  // Buat viewer 3D
  viewer = new skinview3d.SkinViewer({
    canvas: canvas,
    width: 380,
    height: 480,
    skin: "https://files.catbox.moe/456z8k.png", // Skin default sementara
    animation: new skinview3d.WalkingAnimation()
  });

  // Tampilkan daftar pose
  renderPoseList();

  // Pilih pose pertama secara otomatis
  pilihPose(poses[0]);

  // Event listener upload skin
  skinInput.addEventListener('change', handleSkinUpload);

  // Event listener download
  downloadBtn.addEventListener('click', downloadImage);
}

// === TAMPILKAN DAFTAR POSE ===
function renderPoseList() {
  poseList.innerHTML = '';
  poses.forEach(pose => {
    const btn = document.createElement('button');
    btn.className = 'pose-btn';
    btn.dataset.id = pose.id;
    btn.innerHTML = `${pose.name}<br><small>${pose.description}</small>`;
    btn.onclick = () => pilihPose(pose);
    poseList.appendChild(btn);
  });
}

// === PILIH & TERAPKAN POSE ===
function pilihPose(pose) {
  selectedPose = pose;

  // Update tombol aktif
  document.querySelectorAll('.pose-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-id="${pose.id}"]`).classList.add('active');

  // Terapkan ke model 3D
  applyPose(pose);
}

function applyPose(pose) {
  viewer.camera.position.z = pose.cameraDistance;
  viewer.player.rotation.y = pose.bodyRotation;
  
  viewer.player.skin.rightArm.rotation.x = pose.rightArmX;
  viewer.player.skin.rightArm.rotation.y = pose.rightArmY;
  viewer.player.skin.leftArm.rotation.x = pose.leftArmX;
  viewer.player.skin.leftArm.rotation.y = pose.leftArmY;
  
  viewer.player.skin.rightLeg.rotation.x = pose.rightLegX;
  viewer.player.skin.leftLeg.rotation.x = pose.leftLegX;
}

// === UPLOAD SKIN ===
function handleSkinUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.name.endsWith('.png')) {
    alert('Harap pilih file .png ya!');
    return;
  }

  const url = URL.createObjectURL(file);
  
  viewer.loadSkin(url).then(() => {
    skinLoaded = true;
    skinStatus.textContent = `✅ ${file.name}`;
    skinStatus.style.color = '#88ffaa';
    downloadBtn.disabled = false;
    applyPose(selectedPose); // Pastikan pose tetap terjaga
  }).catch(err => {
    skinStatus.textContent = '❌ Gagal memuat skin';
    skinStatus.style.color = '#ff8888';
  });
}

// === DOWNLOAD HASIL ===
function downloadImage() {
  const link = document.createElement('a');
  link.download = `pts-mc-${selectedPose.id}-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// MULAI!
init();
