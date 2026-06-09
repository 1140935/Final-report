// 預設的餐廳資料庫 (這裡可以換成你們學校附近的店)
const defaultRestaurants = [
    { name: "學餐自助餐", category: "飯類", price: "低" },
    { name: "校門口乾麵", category: "麵類", price: "低" },
    { name: "轉角義大利麵", category: "西式", price: "中" },
    { name: "巷口麥當勞", category: "速食", price: "中" },
    { name: "豪華牛排館", category: "西式", price: "高" },
    { name: "阿嬤的滷肉飯", category: "飯類", price: "低" }
];

// 從 LocalStorage 讀取使用者自訂的餐廳，如果沒有就空陣列
let customRestaurants = JSON.parse(localStorage.getItem('myRestaurants')) || [];

let isDrawing = false; // 防止重複點擊抽籤

// 取得合併後的完整餐廳名單
function getAllRestaurants() {
    return [...defaultRestaurants, ...customRestaurants];
}

// 步驟三：自訂新增餐廳功能
function addRestaurant() {
    const inputArea = document.getElementById('new-restaurant');
    const newName = inputArea.value.trim();
    
    if (newName === "") {
        alert("請輸入餐廳名稱！");
        return;
    }

    // 預設分類為飯類，價格為中等 (你可以再擴充讓使用者選)
    const newObj = { name: newName, category: "飯類", price: "中" };
    customRestaurants.push(newObj);
    
    // 存入瀏覽器的 LocalStorage，這樣重整網頁資料不會不見！
    localStorage.setItem('myRestaurants', JSON.stringify(customRestaurants));
    
    inputArea.value = "";
    alert(`已將「${newName}」加入抽籤池！`);
}

// 步驟二 & 三：篩選與進階抽籤動畫
function startDraw() {
    if (isDrawing) return; // 動畫執行中不可重複點擊

    const categoryFilter = document.getElementById('category-filter').value;
    const priceFilter = document.getElementById('price-filter').value;
    const resultBox = document.getElementById('result-box');
    const mapLink = document.getElementById('map-link');

    // 1. 根據使用者的選擇過濾餐廳
    const pool = getAllRestaurants().filter(item => {
        const matchCategory = categoryFilter === "all" || item.category === categoryFilter;
        const matchPrice = priceFilter === "all" || item.price === priceFilter;
        return matchCategory && matchPrice;
    });

    if (pool.length === 0) {
        resultBox.innerText = "沒有符合條件的餐廳😢";
        mapLink.style.display = "none";
        return;
    }

    isDrawing = true;
    mapLink.style.display = "none"; // 動畫期間隱藏地圖連結
    
    // 2. 步驟二：進階跑馬燈動畫效果
    let counter = 0;
    const duration = 2000; // 動畫總時長 2 秒
    const speed = 50; // 每 50 毫秒切換一次名字

    // 使用 setInterval 創造名字快速切換的視覺效果
    const timer = setInterval(() => {
        // 隨機從過濾後的池子挑選名字顯示
        const randomIndex = Math.floor(Math.random() * pool.length);
        resultBox.innerText = pool[randomIndex].name;
        counter += speed;

        // 當時間到了，停止動畫並顯示最終結果
        if (counter >= duration) {
            clearInterval(timer);
            
            // 決定最終贏家
            const finalWinner = pool[Math.floor(Math.random() * pool.length)];
            resultBox.innerText = `🎉 ${finalWinner.name} 🎉`;
            
            // 設定 Google Maps 搜尋連結
            mapLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(finalWinner.name)}`;
            mapLink.style.display = "inline-block";
            
            isDrawing = false; // 解除鎖定
        }
    }, speed);
}
