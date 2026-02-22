const https = require('https');
const map = {
  triggers: 'Direct%20hit/3D/direct_hit_3d.png',
  bloating: 'Bubbles/3D/bubbles_3d.png',
  fear: 'Fork%20and%20knife%20with%20plate/3D/fork_and_knife_with_plate_3d.png',
  understand: 'Magnifying%20glass%20tilted%20left/3D/magnifying_glass_tilted_left_3d.png',
  ibs_d: 'Droplet/3D/droplet_3d.png',
  ibs_c: 'Brick/3D/brick_3d.png',
  unsure: 'Person%20shrugging/3D/person_shrugging_3d_default.png',
  gas: 'Dashing%20away/3D/dashing_away_3d.png',
  cramping: 'High%20voltage/3D/high_voltage_3d.png',
  nausea: 'Nauseated%20face/3D/nauseated_face_3d.png',
  dairy: 'Glass%20of%20milk/3D/glass_of_milk_3d.png',
  garlic: 'Garlic/3D/garlic_3d.png',
  onion: 'Onion/3D/onion_3d.png',
  gluten: 'Croissant/3D/croissant_3d.png',
  caffeine: 'Hot%20beverage/3D/hot_beverage_3d.png',
  spicy: 'Hot%20pepper/3D/hot_pepper_3d.png',
  alcohol: 'Wine%20glass/3D/wine_glass_3d.png',
  beans: 'Peanuts/3D/peanuts_3d.png',
  sad: 'Confounded%20face/3D/confounded_face_3d.png',
  neutral: 'Neutral%20face/3D/neutral_face_3d.png',
  happy: 'Relieved%20face/3D/relieved_face_3d.png',
  safe: 'Green%20circle/3D/green_circle_3d.png',
  caution: 'Yellow%20circle/3D/yellow_circle_3d.png',
  risky: 'Red%20circle/3D/red_circle_3d.png',
  camera: 'Camera%20with%20flash/3D/camera_with_flash_3d.png',
  star: 'Star/3D/star_3d.png',
  check: 'Check%20mark%20button/3D/check_mark_button_3d.png'
};

Object.entries(map).forEach(([key, path]) => {
  const url = `https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/${path}`;
  https.get(url, (res) => {
    console.log(`${key}: ${res.statusCode}`);
  });
});
