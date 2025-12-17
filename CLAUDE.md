# peiyao.run 設計指引

1. 核心架構與導航 (Navigation)

請建立一個響應式導航欄 (Nav Bar)，包含以下連結 [1]：

Logo: 網站標誌 (左側)

Works: 作品集 (/works)

Exhibitions: 展覽歷程 (/exhibitions)

Writings: 寫作/評論 (/writings)

About: 關於 (/about)

CV: 履歷 (/cv)

2. 設計系統 (Design System) [2]

配色:

背景色：淺灰色 (Light Gray)

內容卡片：白色 (White)

風格:

極簡主義，強調留白。

資訊呈現清晰，以內容（圖片與文字）為主角。

3. 多語言設定 (Language Strategy) [3][4]

預設語言: 英文 (English)

第二語言: 中文 (Chinese)，路徑為 /tw。

架構: 支援 i18n 路由結構。

4. 頁面詳細規格 (Page Specifications)

A. 首頁 (Home Page) [5]

請依照以下順序區塊設計首頁：

Hero Section: 全版或大型主視覺圖片。

精選作品 (Featured Works):

佈局：1 個大圖 (重點作品) + 3 個小圖。

點擊可進入作品詳情。

現在展出 (Current Exhibition):

邏輯判斷：如果目前有正在進行的展覽才顯示，否則隱藏此區塊。

最新文章 (Latest Writings):

顯示最新的 4 篇文章。

內容：標題 + 簡短摘要 (Summary)。

近期展覽 (Recent Exhibitions):

顯示最近的 3 筆展覽紀錄。

內容：展覽標題、年份、地點。

B. 作品頁 (Works - /works) [6]

形式：Gallery (畫廊) 模式。

邏輯：作品是獨立存在的實體，可能出現在多個展覽中。此頁面應展示作品本身的檔案與紀錄。

C. 展覽頁 (Exhibitions - /exhibitions) [7]

形式：時間軸 (Timeline) 列表。

內容類型：個展、聯展、表演 (Performance)。

顯示重點：以 Album (相簿/圖輯) 為主呈現展覽現場。

D. 寫作頁 (Writings - /writings) [8]

形式：時間軸排版，左側或右側搭配縮圖。

分類標籤：藝術評論 (Reviews)、歌詞創作、研究筆記、隨筆。

E. 關於頁 (About - /about) [9]

包含三個主要區塊：

Bio (簡介)

Contact (聯絡資訊)

Links (相關連結)

F. 履歷頁 (CV - /cv) [10]

簡潔的文字列表排版。

G. Single 頁面

所有作品、展覽、寫作、about 的各別頁面都共用同一 single layout

## 技術

* Hugo
* Tailwind CSS

直接將 layouts 放在 `layouts` 下，不需另開主題目錄
