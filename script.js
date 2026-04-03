// ==========================================
// 設定：GASのウェブアプリURLをここに貼り付け
// ==========================================
const GAS_URL = 'https://script.google.com/macros/s/AKfycbzokkETRouEg5AHNQWiuBGDJiRfakItv34fqrHB9Oore1Hnz6vepi7NQ0VN2wZLg3yTgQ/exec'; 

async function initDashboard() {
    try {
        // 1. ダッシュボード用データ（投稿＋属性）の取得
        const response = await fetch(`${GAS_URL}?type=summary`);
        const data = await response.json();
        
        renderRoleChart(data);
        renderPostFeed(data);
        
        // 2. 週報とイベントの取得（これらは別のシートに保存されている前提）
        // ※今回は簡易化のため、同じエンドポイントで取得する構成にしています
        updateWeeklyAndEvents();

        document.getElementById('update-time').innerText = `最終更新: ${new Date().toLocaleTimeString()}`;
    } catch (error) {
        console.error('データの取得に失敗しました:', error);
        document.getElementById('weekly-report').innerText = 'データの読み込みに失敗しました。';
    }
}

// 投稿者の属性分布グラフ
function renderRoleChart(data) {
    const roleCounts = {};
    data.forEach(item => {
        const role = item.role || '不明';
        roleCounts[role] = (roleCounts[role] || 0) + 1;
    });

    const ctx = document.getElementById('roleChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(roleCounts),
            datasets: [{
                data: Object.values(roleCounts),
                backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// 投稿フィードの描画
function renderPostFeed(data) {
    const feedContainer = document.getElementById('post-feed');
    feedContainer.innerHTML = '';

    // 直近20件を表示
    data.slice().reverse().slice(0, 20).forEach(post => {
        const card = document.createElement('div');
        card.className = 'bg-white p-4 rounded-lg shadow border-l-4 border-blue-500';
        card.innerHTML = `
            <div class="flex items-center mb-2">
                <span class="font-bold text-blue-600 mr-2">${post.userName}</span>
                <span class="text-xs bg-gray-200 px-2 py-1 rounded">${post.role} / ${post.grade}</span>
                <span class="ml-auto text-xs text-gray-400">${post.date}</span>
            </div>
            <p class="text-sm text-gray-700">${post.text}</p>
            <div class="mt-2 text-xs text-gray-400 italic"># ${post.channel}</div>
        `;
        feedContainer.appendChild(card);
    });
}

// 週報とイベント（今回は仮のデータまたは追加fetchで対応）
async function updateWeeklyAndEvents() {
    // 本来は GAS_URL?type=weekly などを叩く
    // ここではデモ用に「summary」のデータから簡易表示する例を記述可能ですが
    // 基本的にはGAS側で作った weekly_reports シートの最新1件を出すのが理想です。
}

// 実行
initDashboard();
