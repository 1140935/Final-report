// 1. 預設的餐廳資料庫
const defaultRestaurants = [
   
];

let customRestaurants = JSON.parse(localStorage.getItem('myRestaurants')) || [];
let isDrawing = false;

// 取得所有餐廳 (包含預設與附近搜尋的)
function getAllRestaurants() {
    return [...defaultRestaurants, ...customRestaurants];
}

// 手動新增餐廳功能
function addRestaurant() {
    const inputArea = document.getElementById('new-restaurant');
    const newName = inputArea.value.trim();
    if (newName === "") {
        alert("請輸入餐廳名稱！");
        return;
    }
    // 自己想吃的店，預設給它 5 顆星，確保不會被篩選掉
    const newObj = { name: newName, category: "自訂", price: "中", rating: 5.0 };
    customRestaurants.push(newObj);
    localStorage.setItem('myRestaurants', JSON.stringify(customRestaurants));
    inputArea.value = "";
    alert(`已將「${newName}」加入抽籤池！`);
}

// 開始抽籤與評分篩選邏輯
function startDraw() {
    if (isDrawing) return;

    const resultBox = document.getElementById('result-box');
    const mapLink = document.getElementById('map-link');
    
    // 取得使用者選擇的最低評分限制
    const minRating = parseFloat(document.getElementById('rating-filter').value);

    // 進行評分過濾
    const pool = getAllRestaurants().filter(item => {
        const itemRating = item.rating || 0; 
        return itemRating >= minRating;
    });

    if (pool.length === 0) {
        resultBox.innerText = "該範圍與評分下沒有餐廳😢";
        mapLink.style.display = "none";
        return;
    }

    isDrawing = true;
    mapLink.style.display = "none";
    
    let counter = 0;
    const duration = 2000;
    const speed = 50;

    const timer = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * pool.length);
        resultBox.innerText = pool[randomIndex].name;
        counter += speed;

        if (counter >= duration) {
            clearInterval(timer);
            const finalWinner = pool[Math.floor(Math.random() * pool.length)];
            
            const ratingDisplay = finalWinner.rating ? `(${finalWinner.rating}⭐)` : "";
            resultBox.innerText = `🎉 ${finalWinner.name} ${ratingDisplay} 🎉`;
            
            mapLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(finalWinner.name)}`;
            mapLink.style.display = "inline-block";
            isDrawing = false;
        }
    }, speed);
}

// 觸發 Google Maps API 定位
async function fetchNearbyRestaurants() {
    const statusText = document.getElementById('location-status');
    const radiusValue = document.getElementById('radius-select').value;
    
    statusText.innerText = "正在取得您的位置...";

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                statusText.innerText = `位置取得成功！正在搜尋 ${radiusValue} 公尺內的餐廳...`;
                
                searchPlaces(lat, lng, statusText, radiusValue); 
            },
            (error) => {
                statusText.innerText = "無法取得位置，請確認是否開啟定位權限！";
                console.error(error);
            }
        );
    } else {
        statusText.innerText = "您的瀏覽器不支援定位功能。";
    }
}

// 使用 Place API 搜尋附近並抓取評分
async function searchPlaces(lat, lng, statusText, radius) {
    try {
        const request = {
            fields: ['displayName', 'rating'],
            locationRestriction: {
                center: { lat: lat, lng: lng },
                radius: parseInt(radius),
            },
            includedPrimaryTypes: ['restaurant'],
            maxResultCount: 20,
        };

        const { places } = await google.maps.places.Place.searchNearby(request);

        if (places && places.length > 0) {
            customRestaurants = []; 
            places.forEach(place => {
                customRestaurants.push({
                    name: place.displayName || "未知餐廳",
                    category: "附近搜尋",
                    rating: place.rating || 0 
                });
            });

            statusText.innerText = `✅ 成功抓取範圍內 ${places.length} 家餐廳！現在可以開始抽籤了。`;
            statusText.style.color = "green";

        } else {
            statusText.innerText = "指定範圍內找不到餐廳😢，請嘗試擴大範圍。";
            statusText.style.color = "red";
        }
    } catch (error) {
        console.error("Places API 錯誤:", error);
        statusText.innerText = "抓取失敗！請確認是否已啟用「Places API (New)」並綁定信用卡。";
        statusText.style.color = "red";
    }
}
