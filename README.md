# PianoKeyboard - 타이핑 피아노 연주기

컴퓨터 키보드를 타이핑할 줄 안다면 누구나 피아노를 쉽게 연주할 수 있게 해주는 교육용 웹 프로그램입니다. 기존의 복잡한 음표 대신 컴퓨터 키보드의 자판 기호(자음/모음 또는 숫자)를 음표의 머리(Notehead)에 직접 렌더링하여 초보자도 악보를 보고 바로 연주할 수 있도록 도와줍니다.

---

## 🌟 주요 기능

1. **커스텀 음표 렌더링 (Custom Noteheads)**
   - VexFlow 4 라이브러리를 이용하여 표준 오선지 악보를 그린 후, 기본 음표 머리를 투명하게 지우고 그 자리에 컴퓨터 자판 문자가 들어간 컬러풀한 SVG 원형 오버레이를 주입합니다.
   - 음 높이에 따라 차별화된 HSL 색상이 입혀져 시각적으로 음고를 보다 직관적으로 인지할 수 있습니다.

2. **한글/영문 자판 표기 전환**
   - 한글(두벌식) 자음/모음(`ㄱ`, `ㄴ`, `8`) 표기와 영문 QWERTY(`r`, `s`, `8`) 표기 간 전환 기능을 제공합니다.

3. **다양한 플레이 모드**
   - **🎯 연습 모드 (Practice Mode):** 악보 상에서 현재 연주해야 할 음을 녹색으로 강조하며, 사용자가 올바른 키를 입력할 때까지 멈춰 서 대기해 줍니다. 틀린 키를 입력하면 음표가 붉은색으로 반짝입니다.
   - **⚡ 자동 연주 (Auto Play):** 설정된 BPM에 맞추어 노래가 자동으로 재생되며, 가상 건반과 악보의 진행 바가 소리에 동기화되어 움직입니다.
   - **🎹 자유 연주 (Free Play):** 악보 제약 없이 키보드나 마우스 클릭을 이용해 가상 피아노 건반을 자유롭게 연주합니다.

4. **다양한 신디사이저 사운드 (Tone.js)**
   - 피아노(Piano), 파이프 오르간(Organ), 사이버 신디사이저(FM Synth), 사인파(Sine Wave) 중 원하는 음색을 자유롭게 선택해 즐길 수 있습니다.

5. **커스텀 MIDI 악보 변환기 (Transcriber)**
   - 드래그 앤 드롭 또는 파일 업로드를 통해 컴퓨터에 소장 중인 `.mid` 또는 `.midi` 파일을 가져오면, 프로그램 내부에서 시간을 16분음표 격자(Grid) 단위로 양자화(Quantization) 처리하여 오선지 악보와 키 매핑으로 실시간 변환해 줍니다.

---

## 🎹 키보드 매핑 테이블

이 프로그램은 입력 언어(한글/영문) 설정 상태에 영향을 받지 않고 정상 작동할 수 있도록 브라우저의 물리적 키 위치(`event.code`)를 감지하여 렌더링합니다.

* **옥타브 3 (낮은 음역대)**
  - `q`(ㅂ) $\rightarrow$ **G3(솔)** | `w`(ㅈ) $\rightarrow$ **A3(라)** | `e`(ㄷ) $\rightarrow$ **B3(시)**
  - **검은 건반:** `Shift + q`(ㅃ) $\rightarrow$ **G#3** | `Shift + w`(ㅉ) $\rightarrow$ **A#3**

* **옥타브 4 (가운데 기본 음역대)**
  - `r`(ㄱ) $\rightarrow$ **C4(도 - 가온 도)** | `t`(ㅅ) $\rightarrow$ **D4(레)** | `y`(ㅛ) $\rightarrow$ **E4(미)** | `u`(ㅕ) $\rightarrow$ **F4(파)** | `i`(ㅑ) $\rightarrow$ **G4(솔)** | `o`(ㅐ) $\rightarrow$ **A4(라)** | `p`(ㅔ) $\rightarrow$ **B4(시)**
  - **검은 건반:** `Shift + r`(ㄲ) $\rightarrow$ **C#4** | `Shift + t`(ㅆ) $\rightarrow$ **D#4** | `Shift + u`(ㅕ*) $\rightarrow$ **F#4** | `Shift + i`(ㅑ*) $\rightarrow$ **G#4** | `Shift + o`(ㅒ) $\rightarrow$ **A#4**

* **옥타브 5 (높은 음역대)**
  - `7` $\rightarrow$ **C5(도)** | `8` $\rightarrow$ **D5(레)** | `9` $\rightarrow$ **E5(미)** | `0` $\rightarrow$ **F5(파)** | `-` $\rightarrow$ **G5(솔)** | `=` $\rightarrow$ **A5(라)**
  - **검은 건반:** `Shift + 7`(`&`) $\rightarrow$ **C#5** | `Shift + 8`(`*`) $\rightarrow$ **D#5** | `Shift + 0`(`)`) $\rightarrow$ **F#5** | `Shift + -`(`_`) $\rightarrow$ **G#5** | `Shift + =`(`+`) $\rightarrow$ **A#5**

---

## 🛠 기술 스택

- **VexFlow (v4.2.5):** 웹상에서 오선지 악보를 드로잉하기 위한 오픈소스 SVG/Canvas 음악 렌더링 라이브러리.
- **Tone.js (v14.8.49):** 브라우저 환경에서 높은 퍼포먼스와 낮은 레이턴시의 사운드 합성을 도와주는 웹 오디오 프레임워크.
- **@tonejs/midi (unpkg CDN):** MIDI 바이너리 파일을 JSON 구조로 디코딩하여 음 정보와 템포를 읽어내는 라이브러리.
- **Pure JavaScript (ES Modules):** 프레임워크 없는 순수 바닐라 스크립트 기반 동작.
- **Vanilla CSS3:** Glassmorphic 효과 및 반응형 미디어 쿼리가 적용된 프리미엄 다크 모드 스타일링.

---

## 🚀 로컬 실행 방법

이 프로젝트는 정적 파일(HTML, CSS, JS)로만 이루어져 있으므로 별도의 빌드 과정 없이 파일 실행이 가능하지만, Tone.js 오디오 리소스 연결 및 MIDI 파일 로드 시의 보안 제약(CORS)을 피하기 위해 로컬 웹 서버를 사용해 띄우는 것이 좋습니다.

1. **VS Code Live Server 확장 프로그램 활용**
   - `D:\Study\WebPage\PianoKeyboard\Source\index.html` 파일을 우클릭한 후 **"Open with Live Server"**를 클릭하여 실행합니다.

2. **NPM 또는 Python 간이 서버 실행**
   - PowerShell 또는 터미널을 실행하여 `Source` 폴더로 이동합니다.
   - 아래 명령어 중 하나를 사용하여 로컬 웹 서버를 엽니다:
     ```bash
     # Python 3
     python -m http.server 8000
     
     # Node.js (npx)
     npx serve
     ```
   - 브라우저를 열고 `http://localhost:8000` 또는 `http://localhost:3000`에 접속합니다.

---

## 📦 GitHub Pages 배포하기 (deploy.ps1 활용)

루트 디렉터리에 포함된 `deploy.ps1` 파워쉘 스크립트를 사용하여 GitHub 저장소 커밋과 GitHub Pages 배포를 한 번에 자동 처리할 수 있습니다.

1. PowerShell 또는 터미널을 관리자 권한으로 열고 프로젝트 루트 `D:\Study\WebPage\PianoKeyboard`로 이동합니다.
2. 다음 스크립트를 실행합니다:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\deploy.ps1
   ```
3. 스크립트가 실행되면 소스 코드가 `main` 브랜치에 저장되고, 실행 파일(`Source` 폴더 내용)만 `gh-pages` 브랜치에 독립적으로 업로드되어 웹에 즉시 배포됩니다.

GitHub Pages 주소: https://tramper2.github.io/PianoKeyboard/
