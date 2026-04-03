const GAS_URL = 'https://script.google.com/macros/s/AKfycbzokkETRouEg5AHNQWiuBGDJiRfakItv34fqrHB9Oore1Hnz6vepi7NQ0VN2wZLg3yTgQ/exec'; // 新しいデプロイURLに差し替え

async function loadData() {
    try {
        // 並列でデータ取得
        const [resSum, resWeek, resEvent] = await Promise.all([
            fetch(`${GAS_URL}?type=summary`).then(r => r.json()),
            fetch(`${GAS_URL}?type=weekly`).then(r => r.json()),
            fetch(`${GAS_URL}?type=events`).then(r => r.json())
        ]);

        renderSummary(resSum);
        document.getElementById('weekly-report').innerText = resWeek.content;
        renderEvents(resEvent);
        document.getElementById('status').innerText = `最終更新: ${new Date().toLocaleTimeString()}`;
    } catch (e) {
        console.error(e);
        document.getElementById('weekly-report').innerText = "データの取得に失敗しました。GASの公開設定を確認してください。";
    }
}

function renderSummary(data) {
    // グラフ描画
    const counts = {};
    data.forEach(d => counts[d.role] = (counts[d.role] || 0) + 1);
    new Chart(document.getElementById('roleChart'), {
        type: 'bar',
        data: {
            labels: Object.keys(counts),
            datasets: [{ label: '投稿数', data: Object.values(counts), backgroundColor: '#0066FF' }]
        },
        options: { indexAxis: 'y', plugins: { legend: { display: false } } }
    });

    // フィード描画
    const feed = document.getElementById('post-feed');
    feed.innerHTML = data.slice(-20).reverse().map(p => `
        <div class="border-b border-gray-100 pb-3">
            <div class="flex justify-between text-xs text-gray-500 mb-1">
                <span>${p.userName} (${p.role})</span>
                <span>${p.date}</span>
            </div>
            <p class="text-sm">${p.text}</p>
        </div>
    `).join('');
}

function renderEvents(events) {
    const container = document.getElementById('event-list');
    if (events.length === 0) {
        container.innerHTML = "<p class='text-sm opacity-80'>予定されているイベントはありません。</p>";
        return;
    }
    container.innerHTML = events.map(e => `
        <div class="bg-white/10 p-3 rounded border border-white/20">
            <div class="text-xs font-bold">${e.date || '日時未定'}</div>
            <div class="text-sm font-bold my-1">${e.title}</div>
            <div class="text-[10px] opacity-70">📍 ${e.location || '場所不明'}</div>
        </div>
    `).join('');
}

async function manualUpdate() {
    if (!confirm("AI分析を実行します。数十秒かかる場合があります。よろしいですか？")) return;
    const btn = document.getElementById('updateBtn');
    btn.disabled = true;
    btn.innerText = "分析中...";
    
    try {
        await fetch(`${GAS_URL}?type=update`);
        alert("分析が完了しました。ページをリロードします。");
        location.reload();
    } catch (e) {
        alert("エラーが発生しました。");
        btn.disabled = false;
        btn.innerText = "AI分析を手動実行";
    }
}

loadData();
