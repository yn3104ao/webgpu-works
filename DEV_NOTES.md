# WebGPU Development Best Practices & Common Pitfalls 🛡️

F1 CFDおよびReactive Sphereの開発を通じて得られた、WebGPU実装におけるトラブルシューティングとベストプラクティス集。

### 1. メモリ管理・バッファ (Uniforms / Buffers)

#### 🚨 エラー: `RangeError: offset is out of bounds` / データがズレる

- 原因: JSの配列サイズ不足、または WGSL の std140 レイアウト要件（パディング）の無視。

- ルール:

  - **16バイト・アライメント**: WGSLの `vec3<f32>~ や `vec4<f32>` は、JS側では必ず **4要素（16バイト）単位** で配置する。

  - **パディング**: `float` (4バイト) の後に `vec3` を置く場合、間の3つ分（12バイト）はパディング（空き）が必要。

  - **構造体**: JS側でデータを送る際は、`Float32Array` を単に詰めるのではなく、16バイト境界を意識して手動でインデックスを指定するか、パディング用の `0` を含める。

``` javascript
// BAD
// uniform: struct { time: f32, camPos: vec3<f32> }
new Float32Array([time, x, y, z]); // ズレる

// GOOD
// JS側: [time, 0, 0, 0, x, y, z, 0] (32 bytes)
const data = new Float32Array(8);
data[0] = time;
data.set([x,y,z], 4); // index 4 (16byte offset) から開始
```

### 2. テクスチャ・シェーダー (Textures / Shaders)

#### 🚨 エラー: `Texture usage ... incompatible with format`

- **原因**: `r8unorm` や `r16float` などのフォーマットを `STORAGE_BINDING` (書き込み用) として使おうとした。

- **ルール**:

  - **Storage Texture**: 書き込み用途（Compute Shaderの出力先）には、基本的に `rgba16float` や `r32float` を使用する。

  - **読み込み専用**: `r8unorm` などは `TEXTURE_BINDING` (サンプリング用) としてなら使用可能。

#### 🚨 エラー: `textureSample must only be called from uniform control flow`

- **原因**: `if` 文や `for` ループの中で `textureSample()` を呼んでいる。ミップマップ計算に必要な微分情報が取れないため禁止されている。

- **ルール**:

  - ループ内や条件分岐内では、必ず `textureSampleLevel(..., 0.0)` を使用する（ミップマップレベルを0に固定）。

  - または、整数座標でアクセスする `textureLoad()` を使用する。

#### 🚨 エラー: `binding index X not present in the bind group layout`

- **原因**: WGSL内で宣言した変数が、コード内で**一度も使われていない**場合、`layout: 'auto'` がその変数を削除してしまう。JS側でバインドしようとすると不整合が起きる。

- **ルール**:

  - シェーダー内で使わない変数は宣言しない（またはコメントアウト）。

  - JS側でBindGroupを作る際、シェーダーで有効なBinding番号と一致させる。

### 3. レンダリング・パイプライン (Render Pipeline)

#### 🚨 エラー: `color and depth targets from pass do not match pipeline`

- **原因**: RenderPass（描画指示）には深度テクスチャ（Depth Attachment）を設定しているのに、使用するRenderPipeline（ミニマップ描画など）側に `depthStencil` 設定がない。

- **ルール**:

  - 同じRenderPass内で描画する全てのパイプラインは、**出力先のフォーマット設定（Color / Depth）を統一**しなければならない。

  - 深度判定が不要なパイプラインでも、`depthWriteEnabled: false` にしてフォーマット定義だけは記述する必要がある。

### 4. その他・設計 (General)

#### 📦 外部ライブラリ依存

- **教訓**: CDN経由の行列ライブラリ（`wgpu-matrix` 等）は、環境によって読み込みエラーやバージョン不整合のリスクがある。

- 対策: `Mat4`, `Vec3` などの必要最小限の数学クラスを **HTML内に内蔵（Inline implementation）** する。これが最も移植性が高く安定する。

#### 📱 スマホ・レスポンシブ対応

- **教訓**: PC用のUIはスマホでは邪魔になる。

- **対策**:

  - CSSメディアクエリでレイアウトを切り替える（PC: サイドパネル / スマホ: ボトムドロワー）。

  - タッチイベント（`touchstart`, `touchmove`）は `e.preventDefault()` してスクロールを阻止する。

  - Canvas解像度は `window.devicePixelRatio` を考慮しつつ、重いシミュレーションでは `Math.min(dpr, 2.0)` などで制限する。

#### 🌌 次回作：N-Body Galaxy への適用

- **Storage Buffer**: パーティクル数が数百万になるため、Textureではなく **Storage Buffer** (`read_write buffer`) を主戦場にする。

  - 構造体 (`struct Particle { pos: vec3, vel: vec3 }`) のアライメントには特に注意（パディング地獄を避けるため、`vec4` x 2 にするなど工夫する）。

  - **Compute Heavy**: 計算量が $O(N^2)$ になりがちなので、タイルベース計算などの最適化が必要になる可能性大。
