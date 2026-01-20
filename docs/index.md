---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Bento"
  text: "AI RAG Backend Framework"
  tagline: "High-performance AI Chating API with built-in Vector DB"
  image:
    src: https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f371.svg
    alt: Bento
  actions:
    - theme: brand
      text: 시작하기 (Get Started)
      link: /getting-started
    - theme: alt
      text: GitHub 저장소
      link: https://github.com/lambda0x63/bento

features:
  - icon: 🚀
    title: Quick Integration
    details: React, Next.js, Vue 등 주요 프레임워크 원클릭 스캐폴딩 지원.
  - icon: 💬
    title: Multi-Model Support
    details: OpenRouter API를 통한 100종 이상의 LLM 모델 통합 및 통합 인터페이스 제공.
  - icon: 📚
    title: Built-in RAG Engine
    details: LanceDB 내장. PDF/DOCX 파싱 및 벡터 임베딩, 검색 자동화.
  - icon: 🔐
    title: Session Isolation
    details: 멀티 유저 환경을 위한 세션 기반 데이터 격리 미들웨어 탑재.
  - icon: 🌊
    title: Streaming Response
    details: Server-Sent Events (SSE) 기반 실시간 토큰 스트리밍 완벽 지원.
  - icon: 📦
    title: Zero External Deps
    details: 외부 벡터 DB 서비스 불필요. 로컬 파일 시스템만으로 완벽하게 동작.
---
