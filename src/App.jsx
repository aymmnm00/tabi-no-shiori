import React, { useState, useMemo, useRef, useEffect } from "react";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebaseClient";
import {
  Plus, X, MapPin, Calendar, Package, ShoppingCart, ListChecks, Ticket,
  ArrowLeft, Archive, ExternalLink, Check, Menu, Trash2, Pencil, Download,
  Users, ChevronRight, RotateCcw, Sparkles, ArrowRight, Heart, Map, Lock,
} from "lucide-react";

/* ============================== スタイル ============================== */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@500;700;900&family=Zen+Kaku+Gothic+New:wght@400;500;700&display=swap');

.app-root {
  --sky: #7FCBF2; --sky-soft: #B4E0F5; --sky-deep: #3FA9E0; --navy: #33566E;
  --pink: #FFB6B9; --pink-soft: #FFD5D7; --coral: #FFB4A2; --cream: #F5FBFD;
  --sand: #FDF0E9; --gray: #BFC9D2; --green: #71C6AC;
  font-family: 'Zen Kaku Gothic New', sans-serif;
  background: linear-gradient(180deg, #EDF8FC 0%, #F5FBFD 30%, #FDF6F1 100%);
  background-attachment: fixed; color: var(--navy);
  max-width: 480px; margin: 0 auto; min-height: 100vh; position: relative; overflow-x: hidden;
}
.loading { display:flex; align-items:center; justify-content:center; gap:8px; height:100vh; color:var(--sky-deep); font-weight:700; }
.save-error { background:#FFE3DC; color:#C25B3E; font-size:12px; text-align:center; padding:6px; }
.field-hint { font-size:10.5px; opacity:0.55; margin-top:3px; line-height:1.5; }
.tz-toggle { display:flex; gap:6px; margin-top:2px; }
.tz-btn { flex:1; background:white; border:1.5px solid #E4E9ED; border-radius:12px; padding:8px 6px; font-size:12px; font-weight:700; color:var(--navy); opacity:0.55; cursor:pointer; }
.tz-btn.active { opacity:1; background:linear-gradient(135deg,#3FA9E0,#5FBEEA); color:white; border-color:transparent; box-shadow:0 4px 10px rgba(63,169,224,0.25); }
.tz-pin { font-size:12px; }
.carryover-card { background:#EAF6FB; border:1.5px dashed var(--sky-soft); border-radius:14px; padding:10px 13px; font-size:12px; font-weight:700; color:var(--sky-deep); }
.content { padding:16px 16px 40px; }
.screen { display:flex; flex-direction:column; gap:20px; }
.home-topbar { display:flex; align-items:center; justify-content:space-between; }
.home-topbar-title { font-family:'Zen Maru Gothic', sans-serif; font-weight:700; font-size:16px; letter-spacing:0.03em; }
.home-topbar-title::before { content:'🌴 '; }
.hero-empty { background:linear-gradient(150deg,#8FD3F4 0%,#B4E4F6 55%,#FFD5D7 100%); border-radius:28px; padding:44px 20px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:10px; color:#fff; box-shadow:0 12px 28px rgba(63,169,224,0.25); }
.hero-empty svg { filter:drop-shadow(0 2px 6px rgba(51,86,110,0.15)); }
.hero-empty h2 { font-family:'Zen Maru Gothic', sans-serif; margin:4px 0 0; font-size:18px; }
.hero-empty p { margin:0; opacity:0.9; font-size:13px; }
.hero-empty .btn-primary { background:#fff; color:var(--sky-deep); box-shadow:0 6px 16px rgba(51,86,110,0.15); margin-top:4px; }
.home-hero { background:linear-gradient(150deg,#8FD3F4 0%,#B4E4F6 55%,#FFD5D7 100%); border-radius:28px; padding:28px 22px; text-align:center; cursor:pointer; box-shadow:0 12px 28px rgba(63,169,224,0.28); position:relative; overflow:hidden; }
.home-hero::after { content:''; position:absolute; top:-40px; right:-30px; width:130px; height:130px; border-radius:50%; background:rgba(255,255,255,0.25); }
.home-hero-emoji { font-size:42px; position:relative; }
.home-hero-count { font-family:'Zen Maru Gothic', sans-serif; font-weight:900; font-size:22px; color:#fff; margin-top:4px; position:relative; text-shadow:0 2px 8px rgba(51,86,110,0.18); }
.home-hero-name { font-weight:700; font-size:15px; margin-top:6px; color:#fff; position:relative; }
.home-hero-dest { font-size:12px; color:#fff; opacity:0.95; display:flex; align-items:center; justify-content:center; gap:3px; margin-top:4px; position:relative; }
.home-hero-dates { font-size:11px; color:#fff; opacity:0.85; margin-top:2px; position:relative; }
.section { display:flex; flex-direction:column; gap:8px; }
.section-title { font-family:'Zen Maru Gothic', sans-serif; font-weight:700; font-size:14px; display:flex; align-items:center; gap:7px; color:var(--navy); }
.section-title svg { color:var(--pink); }
.mini-item { display:flex; align-items:center; gap:8px; background:white; border-radius:16px; padding:11px 13px; font-size:13px; box-shadow:0 3px 10px rgba(63,169,224,0.07); }
.mini-item.clickable { cursor:pointer; transition:transform 0.12s, box-shadow 0.12s; }
.mini-item.clickable:active { transform:scale(0.99); background:#F3FAFE; }
.mini-item-body { flex:1; min-width:0; }
.mini-item-time-row { display:flex; align-items:center; gap:4px; }
.mini-time { font-weight:700; color:var(--sky-deep); font-size:12.5px; }
.mini-date-label { font-weight:700; color:var(--navy); opacity:0.55; font-size:11px; }
.mini-arrow { opacity:0.5; }
.mini-title { font-size:13px; margin-top:1px; }
.mini-loc { font-size:11px; opacity:0.65; display:flex; align-items:center; gap:3px; margin-top:2px; }
.cat-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; margin-top:3px; }
.btn-primary { background:linear-gradient(135deg,#3FA9E0,#5FBEEA); color:white; border:none; border-radius:16px; padding:13px 18px; font-weight:700; font-size:14px; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:6px; box-shadow:0 6px 16px rgba(63,169,224,0.3); }
.btn-primary:disabled { opacity:0.4; cursor:not-allowed; }
.btn-primary.full { width:100%; }
.btn-secondary { background:white; color:var(--sky-deep); border:1.5px solid var(--sky-soft); border-radius:16px; padding:12px 16px; font-weight:700; font-size:13px; cursor:pointer; box-shadow:0 3px 10px rgba(63,169,224,0.08); }
.btn-secondary.full { width:100%; }
.btn-mini { background:linear-gradient(135deg,#5FBEEA,#7FCBF2); color:white; border:none; border-radius:12px; padding:9px 13px; font-size:12.5px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px; white-space:nowrap; flex-shrink:0; box-shadow:0 3px 10px rgba(63,169,224,0.22); }
.btn-mini.full { width:100%; justify-content:center; margin-top:6px; }
.btn-mini.danger { background:#FFB4A2; color:#8A3B26; box-shadow:none; }
.icon-btn { background:none; border:none; cursor:pointer; color:var(--navy); padding:4px; display:flex; }
.icon-btn.faint { opacity:0.45; }
.icon-btn.faint:hover { opacity:0.9; }
.link-btn { background:none; border:none; color:var(--sky-deep); font-size:12.5px; font-weight:700; cursor:pointer; text-decoration:underline; padding:6px; }
.link-btn.danger { color:#C25B3E; }
.drawer-overlay { position:fixed; inset:0; background:rgba(44,74,99,0.35); z-index:40; opacity:0; pointer-events:none; transition:opacity 0.2s; }
.drawer-overlay.show { opacity:1; pointer-events:auto; }
.drawer { position:fixed; top:0; left:0; bottom:0; width:86%; max-width:340px; background:var(--cream); z-index:45; transform:translateX(-100%); transition:transform 0.25s ease; display:flex; flex-direction:column; box-shadow:4px 0 24px rgba(0,0,0,0.12); }
.drawer.open { transform:translateX(0); }
.drawer-header { display:flex; align-items:center; justify-content:space-between; padding:18px 16px 6px; }
.drawer-header h2 { font-family:'Zen Maru Gothic', sans-serif; font-size:17px; margin:0; }
.drawer-body { padding:6px 16px 24px; overflow-y:auto; display:flex; flex-direction:column; gap:18px; }
.trip-card { display:flex; align-items:center; gap:12px; background:white; border-radius:18px; padding:13px 13px; cursor:pointer; box-shadow:0 4px 14px rgba(63,169,224,0.1); transition:transform 0.12s; }
.trip-card:active { transform:scale(0.99); }
.trip-card-emoji { font-size:26px; }
.trip-card-body { flex:1; min-width:0; }
.trip-card-name { font-weight:700; font-size:14px; }
.trip-card-dest { font-size:11.5px; opacity:0.7; display:flex; align-items:center; gap:3px; margin-top:2px; }
.trip-card-dates { font-size:11px; opacity:0.55; margin-top:2px; }
.chevron { opacity:0.3; flex-shrink:0; }
.empty-state { display:flex; flex-direction:column; align-items:center; gap:6px; color:var(--gray); padding:22px 0; font-size:12.5px; }
.overlay { position:fixed; inset:0; background:rgba(44,74,99,0.35); display:flex; align-items:flex-end; justify-content:center; z-index:60; }
.panel { background:var(--cream); width:100%; max-width:480px; border-radius:24px 24px 0 0; max-height:88vh; display:flex; flex-direction:column; }
.panel-header { display:flex; align-items:center; justify-content:space-between; padding:18px 20px 6px; }
.panel-header h3 { font-family:'Zen Maru Gothic', sans-serif; margin:0; font-size:17px; }
.panel-body { padding:6px 20px 10px; overflow-y:auto; display:flex; flex-direction:column; gap:4px; }
.panel-footer { padding:12px 20px 20px; }
.field-label { font-size:11.5px; font-weight:700; opacity:0.6; margin:10px 0 4px; display:block; }
.field-input { width:100%; border:1.5px solid #E4E9ED; border-radius:12px; padding:10px 12px; font-size:13.5px; font-family:inherit; background:white; color:var(--navy); box-sizing:border-box; -webkit-appearance:none; appearance:none; max-width:100%; }
input[type="time"].field-input, input[type="date"].field-input { -webkit-appearance:none; appearance:none; min-width:0; }
.field-row { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:10px; }
.field-row > div { min-width:0; }
.field-row input, .field-row select { width:100%; box-sizing:border-box; }
.checkbox-label { display:flex; align-items:center; gap:6px; font-size:12.5px; margin-top:8px; }
.emoji-picker { display:flex; flex-wrap:wrap; gap:6px; }
.emoji-choice { font-size:20px; background:white; border:2px solid transparent; border-radius:12px; width:42px; height:42px; cursor:pointer; }
.emoji-choice.selected { border-color:var(--sky-deep); background:#E8F6FD; }
.flag-picker { position:relative; }
.flag-picker-results { position:absolute; top:calc(100% + 4px); left:0; right:0; background:white; border-radius:14px; box-shadow:0 8px 20px rgba(63,169,224,0.18); max-height:230px; overflow-y:auto; z-index:5; border:1.5px solid #E4E9ED; }
.flag-picker-item { display:flex; align-items:center; gap:9px; padding:9px 12px; font-size:13px; cursor:pointer; }
.flag-picker-item:hover { background:#F3FAFE; }
.flag-picker-item .flag-emoji { font-size:19px; }
.chip-row { display:flex; flex-wrap:wrap; gap:6px; align-items:center; }
.chip { background:#E3F4FC; color:var(--sky-deep); border-radius:999px; padding:5px 11px; font-size:12px; font-weight:700; display:inline-flex; align-items:center; gap:5px; cursor:default; }
.chip svg { cursor:pointer; opacity:0.6; }
.chip.static { background:#E3F4FC; }
.member-avatar-btn { width:40px; height:40px; border-radius:50%; background:#E3F4FC; display:flex; align-items:center; justify-content:center; overflow:hidden; border:1.5px dashed var(--sky-deep); cursor:pointer; flex-shrink:0; }
.member-avatar-btn img { width:100%; height:100%; object-fit:cover; }
.member-chip-avatar { width:20px; height:20px; border-radius:50%; overflow:hidden; background:white; display:flex; align-items:center; justify-content:center; font-size:10.5px; font-weight:700; color:var(--sky-deep); flex-shrink:0; }
.member-chip-avatar img { width:100%; height:100%; object-fit:cover; }
.add-inline { display:flex; gap:8px; margin-top:4px; }
.add-inline input { flex:1; border:1.5px solid #E4E9ED; border-radius:12px; padding:9px 12px; font-size:13px; font-family:inherit; background:white; color:var(--navy); }
.detail-header { display:flex; align-items:center; gap:8px; }
.detail-title { flex:1; display:flex; align-items:center; gap:10px; min-width:0; }
.detail-emoji { font-size:28px; }
.detail-name { font-family:'Zen Maru Gothic', sans-serif; font-weight:700; font-size:16px; }
.detail-sub { font-size:11px; opacity:0.65; display:flex; align-items:center; gap:3px; margin-top:2px; }
.tab-bar { display:flex; gap:4px; overflow-x:auto; padding-bottom:2px; }
.tab-btn { flex-shrink:0; display:flex; flex-direction:column; align-items:center; gap:3px; background:white; border:none; border-radius:15px; padding:9px 14px; color:var(--navy); opacity:0.5; font-size:11px; font-weight:700; cursor:pointer; box-shadow:0 2px 8px rgba(63,169,224,0.06); }
.tab-btn.active { opacity:1; background:linear-gradient(135deg,#FFC2C4,#FFD5D7); color:#A85A5C; box-shadow:0 4px 12px rgba(255,182,185,0.35); }
.tab-content { margin-top:4px; display:flex; flex-direction:column; gap:10px; }
.day-tabs { display:flex; gap:6px; overflow-x:auto; margin-bottom:10px; }
.day-tab { flex-shrink:0; background:white; border:none; border-radius:14px; padding:8px 13px; font-size:11.5px; font-weight:700; color:var(--navy); opacity:0.55; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:1px; box-shadow:0 2px 8px rgba(63,169,224,0.06); }
.day-tab span { font-weight:500; opacity:0.8; font-size:10px; }
.day-tab.active { opacity:1; background:linear-gradient(135deg,#3FA9E0,#5FBEEA); color:white; box-shadow:0 4px 12px rgba(63,169,224,0.28); }
.card-list { display:flex; flex-direction:column; gap:8px; }
.check-row { display:flex; align-items:center; gap:10px; background:white; border-radius:16px; padding:11px 13px; box-shadow:0 3px 10px rgba(63,169,224,0.07); }
.check-row.checked .check-text { text-decoration:line-through; opacity:0.45; }
.check-circle { width:22px; height:22px; border-radius:50%; border:2px solid var(--sky-deep); background:white; display:flex; align-items:center; justify-content:center; color:var(--sky-deep); cursor:pointer; flex-shrink:0; }
.check-row.checked .check-circle { background:var(--green); border-color:var(--green); color:white; }
.check-text { flex:1; font-size:13.5px; }
.check-text-col { flex:1; min-width:0; }
.check-text-col.clickable { cursor:pointer; }
.todo-date-badge { display:flex; align-items:center; gap:3px; margin-top:3px; font-size:10.5px; font-weight:700; color:var(--sky-deep); opacity:0.85; text-decoration:none; }
.check-row.checked .todo-date-badge { opacity:0.4; }
.schedule-item.todo-linked { background:#FAFBFC; border:1.5px dashed #DCE2E7; box-shadow:none; }
.schedule-item.todo-linked .schedule-time-col { color:var(--gray); }
.schedule-item.todo-linked.checked .schedule-title { text-decoration:line-through; opacity:0.45; }
.todo-badge { background:#EEF0F2; color:#6B7280; display:inline-flex; align-items:center; gap:3px; }
.schedule-item { display:flex; gap:10px; background:white; border-radius:18px; padding:13px; box-shadow:0 3px 12px rgba(63,169,224,0.08); }
.schedule-item.clickable { cursor:pointer; transition:transform 0.12s, box-shadow 0.12s; }
.schedule-item.clickable:active { transform:scale(0.99); background:#F8FCFE; }
.schedule-time-badge { display:flex; align-items:center; gap:4px; }
.schedule-time-col { display:flex; flex-direction:column; align-items:center; gap:2px; min-width:46px; font-weight:900; color:var(--sky-deep); font-size:12.5px; font-family:'Zen Maru Gothic', sans-serif; }
.schedule-time-sub { font-size:10px; font-weight:700; opacity:0.75; }
.schedule-main { flex:1; min-width:0; }
.schedule-top { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
.cat-badge { font-size:10.5px; font-weight:700; padding:2px 8px; border-radius:999px; }
.schedule-title { font-weight:700; font-size:13.5px; }
.schedule-meta { display:flex; flex-wrap:wrap; gap:8px; margin-top:6px; font-size:11px; opacity:0.75; }
.meta-link { display:flex; align-items:center; gap:3px; color:var(--sky-deep); text-decoration:none; }
.meta-tag { display:flex; align-items:center; gap:3px; }
.meta-memo { opacity:0.7; }
.reservation-item { display:flex; align-items:center; gap:10px; background:white; border-radius:16px; padding:11px 13px; box-shadow:0 3px 10px rgba(63,169,224,0.07); }
.reservation-body { flex:1; min-width:0; }
.reservation-name { font-weight:700; font-size:13.5px; }
.reservation-meta { display:flex; gap:10px; font-size:11px; opacity:0.7; margin-top:3px; }
.reservation-meta a { color:var(--sky-deep); display:inline-flex; align-items:center; gap:3px; }
.mini-form { background:white; border-radius:18px; padding:14px; display:flex; flex-direction:column; gap:2px; box-shadow:0 3px 12px rgba(63,169,224,0.08); }
.form-actions { display:flex; gap:8px; margin-top:8px; }
.form-actions .btn-mini.full, .form-actions .btn-secondary.full { width:auto; flex:1; margin-top:0; }
.mini-form .field-row { grid-template-columns:minmax(0,1fr) minmax(0,1fr); }
.confirm-delete { display:flex; align-items:center; justify-content:center; gap:8px; flex-wrap:wrap; font-size:12px; }
.print-note { font-size:11.5px; opacity:0.7; text-align:center; padding:10px 4px; }
.map-canvas { width:100%; height:340px; border-radius:18px; overflow:hidden; box-shadow:0 3px 12px rgba(63,169,224,0.08); }
.map-legend { display:flex; gap:14px; font-size:11.5px; align-items:center; flex-wrap:wrap; }
.map-legend span { display:inline-flex; align-items:center; gap:5px; }
.legend-dot { width:11px; height:11px; border-radius:50%; display:inline-block; }
.wish-icon-picker { display:flex; flex-wrap:wrap; gap:5px; margin-top:2px; }
.wish-icon-choice { font-size:16px; background:white; border:2px solid transparent; border-radius:10px; width:38px; height:38px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
.wish-icon-choice.selected { border-color:var(--sky-deep); background:#E8F6FD; }
.wish-item-icon { font-size:19px; flex-shrink:0; }
.wish-filter { display:flex; flex-direction:column; gap:6px; background:white; border-radius:16px; padding:11px 13px; box-shadow:0 3px 10px rgba(63,169,224,0.07); }
.wish-filter-row { display:flex; flex-wrap:wrap; gap:5px; align-items:center; }
.wish-filter-label { font-size:10.5px; font-weight:700; opacity:0.55; width:100%; }
.wish-chip { background:#F1F5F8; color:var(--navy); border:none; border-radius:999px; padding:5px 11px; font-size:12px; font-weight:700; cursor:pointer; }
.wish-chip.on { background:linear-gradient(135deg,#3FA9E0,#5FBEEA); color:white; }
.wish-photo { width:100%; max-height:170px; object-fit:cover; border-radius:12px; margin-top:8px; display:block; }
.wish-memo { font-size:11.5px; opacity:0.75; margin-top:4px; line-height:1.5; white-space:pre-wrap; }
.wish-photo-preview { width:100%; max-height:150px; object-fit:cover; border-radius:12px; margin-top:6px; display:block; }
.wish-country { font-size:10.5px; font-weight:700; color:var(--sky-deep); opacity:0.8; margin-top:2px; }
.coord-missing { font-size:11px; color:#C25B3E; background:#FFE3DC; border-radius:999px; padding:2px 9px; font-weight:700; }
`;

/* ============================== 定数 ============================== */
const EMOJIS = ["✈️","🏖️","⛰️","🗼","🚗","🚄","🏯","🎡","🍜","🏕️","🛳️","🌸"];
const CATEGORIES = [
  { key: "移動", bg: "#FFE3DC", fg: "#C25B3E", dot: "#FFB4A2" },
  { key: "食事", bg: "#FFF3D6", fg: "#B8862E", dot: "#FFD97D" },
  { key: "宿泊", bg: "#EDE6F9", fg: "#6A4FA0", dot: "#B8A6E0" },
  { key: "観光", bg: "#E1F5EC", fg: "#3F8F6C", dot: "#7FC8A9" },
  { key: "その他", bg: "#EEF0F2", fg: "#6B7280", dot: "#C9CED6" },
];
const RESV_CATEGORIES = ["フライト", "ホテル", "レンタカー", "その他"];
// 行きたいところのカテゴリ(地図のピンにもこの絵文字が出る)
const WISH_ICONS = [
  { icon: "☕", label: "カフェ" },
  { icon: "🍽", label: "レストラン" },
  { icon: "🥐", label: "ベーカリー" },
  { icon: "🍦", label: "アイス" },
  { icon: "🍫", label: "チョコレート" },
  { icon: "🍔", label: "軽食" },
  { icon: "🍰", label: "スイーツ" },
  { icon: "🍷", label: "バー" },
  { icon: "🛍", label: "買い物" },
  { icon: "🏨", label: "ホテル" },
  { icon: "🏛", label: "観光地" },
  { icon: "🎨", label: "美術館" },
  { icon: "⛪", label: "教会" },
  { icon: "🌳", label: "公園" },
  { icon: "📷", label: "撮影スポット" },
  { icon: "🌐", label: "その他" },
];
const TODO_PHASES = [
  { key: "pre", label: "旅行前" },
  { key: "during", label: "旅行中" },
  { key: "post", label: "旅行後" },
];
const catInfo = (key) => CATEGORIES.find((c) => c.key === key) || CATEGORIES[4];

/* ---- 合言葉(簡易ロック) ----
   注意:これは「うっかり見えてしまう」のを防ぐ簡易的な仕組みです。
   合言葉は端末内に覚えられ、一度開いた旅行は同じ端末では再入力不要になります。 */
const unlockedIds = new Set();
const isLocked = (t) => !!(t.passcode && !unlockedIds.has(t.id));

/* ============================== 国旗データ ============================== */
const flagEmoji = (code) =>
  code.toUpperCase().replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)));

const COUNTRY_CODES = [
  ["JP", "日本"], ["KR", "韓国"], ["CN", "中国"], ["TW", "台湾"], ["HK", "香港"], ["MO", "マカオ"],
  ["TH", "タイ"], ["VN", "ベトナム"], ["SG", "シンガポール"], ["MY", "マレーシア"], ["ID", "インドネシア"],
  ["PH", "フィリピン"], ["IN", "インド"], ["NP", "ネパール"], ["LK", "スリランカ"], ["KH", "カンボジア"],
  ["LA", "ラオス"], ["MM", "ミャンマー"], ["MN", "モンゴル"], ["BD", "バングラデシュ"], ["BT", "ブータン"],
  ["MV", "モルディブ"], ["PK", "パキスタン"], ["KZ", "カザフスタン"], ["UZ", "ウズベキスタン"],
  ["AE", "アラブ首長国連邦"], ["SA", "サウジアラビア"], ["QA", "カタール"], ["KW", "クウェート"],
  ["BH", "バーレーン"], ["OM", "オマーン"], ["IL", "イスラエル"], ["TR", "トルコ"], ["JO", "ヨルダン"],
  ["LB", "レバノン"], ["IQ", "イラク"], ["IR", "イラン"], ["EG", "エジプト"], ["MA", "モロッコ"],
  ["TN", "チュニジア"], ["ZA", "南アフリカ"], ["KE", "ケニア"], ["TZ", "タンザニア"], ["ET", "エチオピア"],
  ["NG", "ナイジェリア"], ["GH", "ガーナ"], ["MU", "モーリシャス"], ["MG", "マダガスカル"], ["SC", "セーシェル"],
  ["US", "アメリカ合衆国"], ["CA", "カナダ"], ["MX", "メキシコ"], ["BR", "ブラジル"], ["AR", "アルゼンチン"],
  ["CL", "チリ"], ["PE", "ペルー"], ["CO", "コロンビア"], ["EC", "エクアドル"], ["BO", "ボリビア"],
  ["UY", "ウルグアイ"], ["PY", "パラグアイ"], ["CU", "キューバ"], ["JM", "ジャマイカ"], ["DO", "ドミニカ共和国"],
  ["BS", "バハマ"], ["PA", "パナマ"], ["CR", "コスタリカ"], ["GT", "グアテマラ"],
  ["GB", "イギリス"], ["FR", "フランス"], ["DE", "ドイツ"], ["IT", "イタリア"], ["ES", "スペイン"],
  ["PT", "ポルトガル"], ["NL", "オランダ"], ["BE", "ベルギー"], ["CH", "スイス"], ["AT", "オーストリア"],
  ["SE", "スウェーデン"], ["NO", "ノルウェー"], ["DK", "デンマーク"], ["FI", "フィンランド"], ["IS", "アイスランド"],
  ["IE", "アイルランド"], ["GR", "ギリシャ"], ["PL", "ポーランド"], ["CZ", "チェコ"], ["HU", "ハンガリー"],
  ["RO", "ルーマニア"], ["BG", "ブルガリア"], ["HR", "クロアチア"], ["RS", "セルビア"], ["UA", "ウクライナ"],
  ["RU", "ロシア"], ["MC", "モナコ"], ["LU", "ルクセンブルク"], ["MT", "マルタ"], ["CY", "キプロス"],
  ["EE", "エストニア"], ["LV", "ラトビア"], ["LT", "リトアニア"], ["SI", "スロベニア"], ["SK", "スロバキア"],
  ["AL", "アルバニア"], ["BA", "ボスニア・ヘルツェゴビナ"], ["ME", "モンテネグロ"], ["MK", "北マケドニア"],
  ["AD", "アンドラ"], ["LI", "リヒテンシュタイン"], ["SM", "サンマリノ"], ["VA", "バチカン"],
  ["BY", "ベラルーシ"], ["MD", "モルドバ"], ["GE", "ジョージア"], ["AM", "アルメニア"], ["AZ", "アゼルバイジャン"],
  ["AU", "オーストラリア"], ["NZ", "ニュージーランド"], ["FJ", "フィジー"], ["PG", "パプアニューギニア"],
  ["WS", "サモア"], ["TO", "トンガ"], ["PF", "フランス領ポリネシア(タヒチ)"], ["GU", "グアム"], ["NC", "ニューカレドニア"],
];
const EXTRA_EMOJIS = [
  "🏰", "🕌", "⛩️", "🗽", "🎠", "🎢", "🏝️", "🌋", "🎿", "🏊", "🎣", "🍣", "🍕", "🎭", "🐘", "🦁",
  "🏨", "🚢", "🛫", "🧳", "🕶️", "🍹", "🌊", "⛺", "🚡", "🏟️", "🎶", "🍷", "🚴", "⚓", "🌉", "🦩", "🐬", "🎇", "❄️",
];
const FLAG_COUNTRY_CODES = [
  "JP", "KR", "CN", "TW", "HK", "TH", "VN", "SG", "MY", "ID", "PH", "IN",
  "US", "CA", "MX", "BR", "GB", "FR", "DE", "IT", "ES", "PT", "NL", "CH",
  "AT", "GR", "TR", "AE", "AU", "NZ", "EG", "ZA", "MA", "IS", "SE", "NO",
  "DK", "FI", "IE", "CZ", "HU", "HR", "RU",
  "BE", "PL", "AR", "PE", "CL", "CU", "FJ", "MV", "LK", "NP", "KH", "MC",
];
const ICON_CHOICES = [...EMOJIS, ...EXTRA_EMOJIS, ...FLAG_COUNTRY_CODES.map(flagEmoji)];

/* ============================== 日付ヘルパー ============================== */
// IDは「時刻 + ランダム値 + 連番」で作る。
// 以前は連番だけだったため、ページを開き直すと番号が最初に戻り、
// 既存の項目と同じIDになって一覧が二重に出る不具合があった。
let idSeq = 0;
const newId = () =>
  `id${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}${idSeq++}`;

// 配列の中でIDが重複していたら、新しいIDを振り直して返す
function dedupeIds(arr) {
  if (!Array.isArray(arr)) return arr;
  const seen = new Set();
  let changed = false;
  const fixed = arr.map((item) => {
    if (!item || typeof item !== "object") return item;
    if (item.id && !seen.has(item.id)) { seen.add(item.id); return item; }
    changed = true;
    return { ...item, id: newId() };
  });
  return changed ? fixed : arr;
}

// 選んだ画像を小さく圧縮して文字データに変換する
// (Firestoreの保存上限を超えないよう、横幅400px・JPEG品質70%まで縮める)
function readImageCompressed(file, maxWidth = 400) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("読み込み失敗"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("画像を開けません"));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// すでに保存されている大きすぎる画像を縮め直す
// (以前のバージョンで圧縮せずに保存された写真が容量を圧迫するため)
function shrinkDataUrl(dataUrl, maxWidth) {
  return new Promise((resolve) => {
    if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:image")) { resolve(dataUrl); return; }
    const img = new Image();
    img.onerror = () => resolve(dataUrl);
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.src = dataUrl;
  });
}

// 旅行データ全体の画像を、必要なら縮める(30KBを超えるものだけ処理)
async function shrinkTripImages(trips) {
  const LIMIT = 30000;
  let changed = false;
  const out = [];
  for (const trip of trips) {
    const t = { ...trip };
    if (Array.isArray(t.members)) {
      t.members = [];
      for (const m of trip.members) {
        if (m?.photo && m.photo.length > LIMIT) {
          t.members.push({ ...m, photo: await shrinkDataUrl(m.photo, 160) });
          changed = true;
        } else t.members.push(m);
      }
    }
    if (Array.isArray(t.wishlist)) {
      t.wishlist = [];
      for (const w of trip.wishlist) {
        if (w?.photo && w.photo.length > 120000) {
          t.wishlist.push({ ...w, photo: await shrinkDataUrl(w.photo, 400) });
          changed = true;
        } else t.wishlist.push(w);
      }
    }
    out.push(t);
  }
  return changed ? out : null;
}

// Firestoreは「未定義(undefined)」の値を受け付けないため、保存前に取り除く
// (例:到着時刻を空欄にした予定は endTime が未定義になり、保存に失敗していた)
function stripUndefined(value) {
  if (Array.isArray(value)) return value.map(stripUndefined);
  if (value && typeof value === "object") {
    const out = {};
    Object.entries(value).forEach(([k, v]) => {
      if (v === undefined) return;
      out[k] = stripUndefined(v);
    });
    return out;
  }
  return value;
}

// 1つの旅行の中にある全リストのID重複を直す
function repairTrip(trip) {
  const fixed = { ...trip };
  fixed.packingList = dedupeIds(trip.packingList || []);
  fixed.shoppingList = dedupeIds(trip.shoppingList || []);
  fixed.reservations = dedupeIds(trip.reservations || []);
  fixed.wishlist = dedupeIds(trip.wishlist || []);
  fixed.members = dedupeIds(trip.members || []);
  fixed.todos = {
    pre: dedupeIds(trip.todos?.pre || []),
    during: dedupeIds(trip.todos?.during || []),
    post: dedupeIds(trip.todos?.post || []),
  };
  const days = {};
  Object.entries(trip.days || {}).forEach(([d, items]) => { days[d] = dedupeIds(items); });
  fixed.days = days;
  return fixed;
}
const pad2 = (n) => String(n).padStart(2, "0");
const addDaysStr = (dateStr, n) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`;
};
const dateRange = (start, end) => {
  const arr = [];
  let cur = start;
  let guard = 0;
  while (cur <= end && guard < 60) {
    arr.push(cur);
    cur = addDaysStr(cur, 1);
    guard++;
  }
  return arr;
};
const naiveTs = (dateStr, timeStr) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [h, mi] = (timeStr || "00:00").split(":").map(Number);
  return Date.UTC(y, m - 1, d, h || 0, mi || 0);
};
const jstTs = (dateStr, timeStr, timeZone, timeDiffHours) => {
  const naive = naiveTs(dateStr, timeStr);
  if (timeZone === "local" && timeDiffHours) return naive - timeDiffHours * 3600000;
  return naive;
};
const todayStr = () => {
  const t = new Date();
  return `${t.getFullYear()}-${pad2(t.getMonth() + 1)}-${pad2(t.getDate())}`;
};
const nowNaiveTs = () => {
  const t = new Date();
  return Date.UTC(t.getFullYear(), t.getMonth(), t.getDate(), t.getHours(), t.getMinutes());
};
const fmtDateShort = (dateStr) => {
  const [, m, d] = dateStr.split("-");
  return `${Number(m)}/${Number(d)}`;
};
const fmtDateRange = (start, end) => `${fmtDateShort(start)} 〜 ${fmtDateShort(end)}`;
const mapsUrl = (place) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;

// 指定した都市(IANAタイムゾーン)の、指定日におけるUTCからのオフセット(時間)を求める
// (ブラウザ内蔵のIntl APIのみを使用。夏時間(サマータイム)も自動で考慮される。追加の外部サービス不要)
function tzOffsetHours(tz, atDate) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const parts = dtf.formatToParts(atDate).reduce((acc, p) => { acc[p.type] = p.value; return acc; }, {});
  const asUTC = Date.UTC(
    Number(parts.year), Number(parts.month) - 1, Number(parts.day),
    Number(parts.hour) % 24, Number(parts.minute), Number(parts.second)
  );
  return (asUTC - atDate.getTime()) / 3600000;
}
// 日本時間との時差(現地 − 日本)を0.5時間単位で計算する
function computeTimeDiffHours(tz, dateStr) {
  const refDate = dateStr ? new Date(`${dateStr}T12:00:00`) : new Date();
  const local = tzOffsetHours(tz, refDate);
  const jst = tzOffsetHours("Asia/Tokyo", refDate);
  return Math.round((local - jst) * 2) / 2;
}

const CITY_TIMEZONES = [
  { label: "アメリカ(ニューヨーク)", tz: "America/New_York" },
  { label: "アメリカ(ロサンゼルス)", tz: "America/Los_Angeles" },
  { label: "アメリカ・ハワイ(ホノルル)", tz: "Pacific/Honolulu" },
  { label: "カナダ(トロント)", tz: "America/Toronto" },
  { label: "カナダ(バンクーバー)", tz: "America/Vancouver" },
  { label: "メキシコ(メキシコシティ)", tz: "America/Mexico_City" },
  { label: "ブラジル(サンパウロ)", tz: "America/Sao_Paulo" },
  { label: "イギリス(ロンドン)", tz: "Europe/London" },
  { label: "フランス(パリ)", tz: "Europe/Paris" },
  { label: "スペイン(マドリード)", tz: "Europe/Madrid" },
  { label: "ドイツ(ベルリン)", tz: "Europe/Berlin" },
  { label: "イタリア(ローマ)", tz: "Europe/Rome" },
  { label: "オランダ(アムステルダム)", tz: "Europe/Amsterdam" },
  { label: "スイス(チューリッヒ)", tz: "Europe/Zurich" },
  { label: "ギリシャ(アテネ)", tz: "Europe/Athens" },
  { label: "トルコ(イスタンブール)", tz: "Europe/Istanbul" },
  { label: "ロシア(モスクワ)", tz: "Europe/Moscow" },
  { label: "エジプト(カイロ)", tz: "Africa/Cairo" },
  { label: "モロッコ(カサブランカ)", tz: "Africa/Casablanca" },
  { label: "南アフリカ(ヨハネスブルグ)", tz: "Africa/Johannesburg" },
  { label: "UAE(ドバイ)", tz: "Asia/Dubai" },
  { label: "インド(デリー)", tz: "Asia/Kolkata" },
  { label: "タイ(バンコク)", tz: "Asia/Bangkok" },
  { label: "ベトナム(ハノイ)", tz: "Asia/Ho_Chi_Minh" },
  { label: "シンガポール", tz: "Asia/Singapore" },
  { label: "マレーシア(クアラルンプール)", tz: "Asia/Kuala_Lumpur" },
  { label: "インドネシア(バリ島)", tz: "Asia/Makassar" },
  { label: "フィリピン(マニラ)", tz: "Asia/Manila" },
  { label: "韓国(ソウル)", tz: "Asia/Seoul" },
  { label: "中国(北京・上海)", tz: "Asia/Shanghai" },
  { label: "台湾(台北)", tz: "Asia/Taipei" },
  { label: "香港", tz: "Asia/Hong_Kong" },
  { label: "モンゴル(ウランバートル)", tz: "Asia/Ulaanbaatar" },
  { label: "オーストラリア(シドニー)", tz: "Australia/Sydney" },
  { label: "オーストラリア(パース)", tz: "Australia/Perth" },
  { label: "ニュージーランド(オークランド)", tz: "Pacific/Auckland" },
  { label: "グアム", tz: "Pacific/Guam" },
  { label: "フィジー", tz: "Pacific/Fiji" },
];

// 場所名から緯度・経度を調べる(GoogleのGeocoding APIを使用)
// 見つからなければ null を返す。その場合は手入力で補える。
async function lookupCoords(place) {
  if (!place) return null;
  if (!window.google || !window.google.maps) return null;
  try {
    const geocoder = new window.google.maps.Geocoder();
    const result = await geocoder.geocode({ address: place });
    if (result && result.results && result.results[0]) {
      const loc = result.results[0].geometry.location;
      return { lat: loc.lat(), lng: loc.lng() };
    }
  } catch (e) { /* 失敗時はnull */ }
  return null;
}

// 地図リンクを開く(Googleマップ / Citymapper 切り替え対応)
// Citymapperは目的地の座標が必要なため、登録済みの座標を使い、
// 無ければその場で調べてから開く(ポップアップ対策として先に空タブを開いておく)。
function openLocationLink(place, provider, coords) {
  if (!place) return;

  if (provider === "citymapper") {
    const lat = coords && typeof coords.lat === "number" ? coords.lat : null;
    const lng = coords && typeof coords.lng === "number" ? coords.lng : null;

    // 座標が分かっていない場合は、Googleマップで開く(Citymapperは座標がないと目的地を認識しないため)
    if (lat === null || lng === null) {
      window.location.href = mapsUrl(place);
      return;
    }

    // Citymapperアプリを直接呼び出す。アプリが無ければウェブ版に切り替わる。
    const appUrl = `citymapper://directions?endcoord=${lat},${lng}&endname=${encodeURIComponent(place)}`;
    const webUrl = `https://citymapper.com/directions?endcoord=${lat},${lng}&endname=${encodeURIComponent(place)}`;

    let switched = false;
    const onHide = () => { switched = true; };
    document.addEventListener("visibilitychange", onHide, { once: true });

    window.location.href = appUrl;

    // アプリが開かなかった場合だけ、ウェブ版に飛ばす
    setTimeout(() => {
      document.removeEventListener("visibilitychange", onHide);
      if (!switched && !document.hidden) window.location.href = webUrl;
    }, 1200);
    return;
  }

  window.location.href = mapsUrl(place);
}

/* ============================== サンプルデータ ============================== */
const sampleTrips = [
  {
    id: "t1",
    emoji: "🇺🇸",
    name: "ハワイ家族旅行",
    destination: "ホノルル(ハワイ)",
    startDate: "2026-08-15",
    endDate: "2026-08-20",
    members: [
      { id: newId(), name: "お父さん", photo: null },
      { id: newId(), name: "お母さん", photo: null },
      { id: newId(), name: "ゆい", photo: null },
    ],
    isInternational: true,
    timeDiffHours: -19,
    mapProvider: "google",
    archived: false,
    days: {
      "2026-08-15": [
        {
          id: newId(), time: "08:00", endTime: "12:30", endDayOffset: 0,
          title: "成田 → ホノルル(ANA182便)", category: "移動",
          location: "成田国際空港", arrivalLocation: "ダニエル・K・イノウエ国際空港",
          arrivalIsLocalTime: true, memo: "", reservationNumber: "ANA182",
          timeZone: "jst",
        },
        {
          id: newId(), time: "15:00", title: "ホテルチェックイン", category: "宿泊",
          location: "ワイキキ・ビーチ・リゾート", memo: "", timeZone: "local",
        },
        {
          id: newId(), time: "19:00", title: "ウェルカムディナー", category: "食事",
          location: "デュークス・ワイキキ", memo: "海が見える席を予約済み", timeZone: "local",
        },
      ],
      "2026-08-16": [
        { id: newId(), time: "08:00", title: "朝食(ホテル内カフェ)", category: "食事", location: "ホテル内カフェ", timeZone: "local" },
        { id: newId(), time: "10:00", title: "ワイキキビーチでのんびり", category: "観光", location: "ワイキキビーチ", timeZone: "local" },
        { id: newId(), time: "18:30", title: "夕食(ステーキハウス)", category: "食事", location: "ルースズ・クリス", timeZone: "local" },
      ],
      "2026-08-17": [
        { id: newId(), time: "09:30", title: "ダイヤモンドヘッド登山", category: "観光", location: "ダイヤモンドヘッド州立公園", timeZone: "local" },
        { id: newId(), time: "14:00", title: "アラモアナセンターでお買い物", category: "その他", location: "アラモアナセンター", timeZone: "local" },
      ],
      "2026-08-18": [
        { id: newId(), time: "09:00", title: "レンタカーでノースショア観光", category: "移動", location: "ホテル", arrivalLocation: "ハレイワタウン", timeZone: "local" },
        { id: newId(), time: "19:00", title: "夕食(ロコモコ専門店)", category: "食事", location: "ハレイワタウン", timeZone: "local" },
      ],
      "2026-08-19": [
        { id: newId(), time: "10:00", title: "パールハーバー見学", category: "観光", location: "パールハーバー", timeZone: "local" },
        { id: newId(), time: "18:00", title: "ホテルチェックアウト・荷造り", category: "その他", location: "ワイキキ・ビーチ・リゾート", timeZone: "local" },
        {
          id: newId(), time: "21:00", endTime: "05:30", endDayOffset: 1,
          title: "ホノルル → 成田(ANA183便)", category: "移動",
          location: "ダニエル・K・イノウエ国際空港", arrivalLocation: "成田国際空港",
          arrivalIsLocalTime: false, memo: "", reservationNumber: "ANA183",
          timeZone: "local",
        },
      ],
      "2026-08-20": [],
    },
    packingList: [
      { id: newId(), text: "パスポート", checked: false },
      { id: newId(), text: "海外用変換プラグ", checked: false },
      { id: newId(), text: "日焼け止め", checked: true },
      { id: newId(), text: "水着", checked: false },
    ],
    shoppingList: [
      { id: newId(), text: "マカダミアナッツチョコ", checked: false },
      { id: newId(), text: "コナコーヒー", checked: false },
      { id: newId(), text: "プルメリア柄のTシャツ", checked: true },
    ],
    todos: {
      pre: [
        { id: newId(), text: "パスポートの残存期間を確認する", checked: true },
        { id: newId(), text: "海外旅行保険に加入する", checked: false },
        { id: newId(), text: "ESTAを申請する", checked: false },
      ],
      during: [
        {
          id: newId(), text: "現地SIMを購入する", checked: false,
          date: "2026-08-15", time: "13:30", location: "ダニエル・K・イノウエ国際空港",
          timeZone: "local",
        },
      ],
      post: [
        { id: newId(), text: "写真を家族グループに共有する", checked: false },
        { id: newId(), text: "クレジットカードの明細を確認する", checked: false },
      ],
    },
    reservations: [
      { id: newId(), category: "フライト", name: "ANA182便(成田→ホノルル)", number: "ANA182", link: "" },
      { id: newId(), category: "フライト", name: "ANA183便(ホノルル→成田)", number: "ANA183", link: "" },
      { id: newId(), category: "ホテル", name: "ワイキキ・ビーチ・リゾート", number: "RSV-88213", link: "" },
      { id: newId(), category: "レンタカー", name: "アロハ・レンタカー", number: "", link: "" },
    ],
  },
];

/* ============================== 小さい部品 ============================== */
function Chip({ label, onRemove }) {
  return (
    <span className="chip">
      {label}
      {onRemove && <X size={12} onClick={onRemove} />}
    </span>
  );
}

function StaticChip({ label }) {
  return <span className="chip static">{label}</span>;
}

function MemberAvatar({ member, size = 20 }) {
  if (member?.photo) {
    return <img src={member.photo} alt="" style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover" }} />;
  }
  return (
    <span style={{ width: size, height: size, borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.55, fontWeight: 700, color: "var(--sky-deep)" }}>
      {member?.name ? member.name[0] : "?"}
    </span>
  );
}

function MemberChip({ member, onRemove }) {
  return (
    <span className="chip" style={{ paddingLeft: 3 }}>
      <span className="member-chip-avatar"><MemberAvatar member={member} /></span>
      {member.name}
      {onRemove && <X size={12} onClick={onRemove} />}
    </span>
  );
}

function ConfirmDelete({ message = "本当に削除しますか?元に戻せません", onConfirm, onCancel }) {
  return (
    <div className="confirm-delete">
      <span>{message}</span>
      <button className="btn-mini danger" onClick={onConfirm}>削除する</button>
      <button className="link-btn" onClick={onCancel}>やめる</button>
    </div>
  );
}

function CheckRow({ item, onToggle, onEdit, dateLabel }) {
  return (
    <div className={`check-row${item.checked ? " checked" : ""}`}>
      <button className="check-circle" onClick={() => onToggle(item.id)}>
        {item.checked && <Check size={14} />}
      </button>
      <div className={`check-text-col${onEdit ? " clickable" : ""}`} onClick={() => onEdit && onEdit(item)}>
        <span className="check-text">{item.text}</span>
        {dateLabel && (
          <div className="todo-date-badge">
            <Calendar size={11} />
            {dateLabel}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================== 汎用チェックリストタブ(持ち物/買うもの) ============================== */
function SimpleChecklistTab({ list, setList, placeholder, emptyText }) {
  const [text, setText] = useState("");
  const add = () => {
    if (!text.trim()) return;
    setList([...list, { id: newId(), text: text.trim(), checked: false }]);
    setText("");
  };
  const toggle = (id) => setList(list.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));
  const remove = (id) => setList(list.filter((i) => i.id !== id));
  const [deletingId, setDeletingId] = useState(null);

  return (
    <div className="tab-content">
      <div className="add-inline">
        <input
          className="field-input"
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <button className="btn-mini" onClick={add}><Plus size={14} />追加</button>
      </div>
      <div className="card-list">
        {list.length === 0 && <div className="empty-state">{emptyText}</div>}
        {list.map((item) =>
          deletingId === item.id ? (
            <div className="mini-form" key={item.id}>
              <ConfirmDelete
                message="削除しますか?"
                onConfirm={() => { remove(item.id); setDeletingId(null); }}
                onCancel={() => setDeletingId(null)}
              />
            </div>
          ) : (
            <div className="check-row" key={item.id} style={{ position: "relative" }}>
              <button className={`check-circle${item.checked ? "" : ""}`} onClick={() => toggle(item.id)} style={item.checked ? { background: "var(--green)", borderColor: "var(--green)", color: "white" } : {}}>
                {item.checked && <Check size={14} />}
              </button>
              <span className="check-text" style={item.checked ? { textDecoration: "line-through", opacity: 0.45 } : {}}>{item.text}</span>
              <button className="icon-btn faint" onClick={() => setDeletingId(item.id)}><X size={16} /></button>
            </div>
          )
        )}
      </div>
    </div>
  );
}

/* ============================== 旅行フォーム(新規作成/編集 共通) ============================== */
function TripFormPanel({ initial, onSave, onClose }) {
  const isEdit = !!initial;
  const [emoji, setEmoji] = useState(initial?.emoji || ICON_CHOICES[0]);
  const [name, setName] = useState(initial?.name || "");
  const [destination, setDestination] = useState(initial?.destination || "");
  const [startDate, setStartDate] = useState(initial?.startDate || "");
  const [endDate, setEndDate] = useState(initial?.endDate || "");
  const [isInternational, setIsInternational] = useState(initial?.isInternational || false);
  const [timeDiffHours, setTimeDiffHours] = useState(
    initial?.timeDiffHours != null ? String(initial.timeDiffHours) : ""
  );
  const [members, setMembers] = useState(initial?.members || []);
  const [memberInput, setMemberInput] = useState("");
  const [memberPhoto, setMemberPhoto] = useState(null);
  const [mapProvider, setMapProvider] = useState(initial?.mapProvider || "google");
  const [passcode, setPasscode] = useState(initial?.passcode || "");

  const canSave = name.trim() && destination.trim() && startDate && endDate && endDate >= startDate;

  const addMember = () => {
    if (!memberInput.trim()) return;
    setMembers([...members, { id: newId(), name: memberInput.trim(), photo: memberPhoto }]);
    setMemberInput("");
    setMemberPhoto(null);
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // メンバーのアイコンは小さく表示されるので、160pxまで圧縮する
    try { setMemberPhoto(await readImageCompressed(file, 160)); } catch (err) { /* 失敗時は何もしない */ }
  };

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      ...(initial || {}),
      id: initial?.id || newId(),
      emoji, name: name.trim(), destination: destination.trim(),
      startDate, endDate, members,
      isInternational,
      timeDiffHours: isInternational ? (timeDiffHours === "" ? 0 : Number(timeDiffHours)) : 0,
      mapProvider,
      passcode: passcode.trim(),
      archived: initial?.archived || false,
      days: initial?.days || {},
      packingList: initial?.packingList || [],
      shoppingList: initial?.shoppingList || [],
      todos: initial?.todos || { pre: [], during: [], post: [] },
      reservations: initial?.reservations || [],
      wishlist: initial?.wishlist || [],
    });
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <h3>{isEdit ? "旅行を編集" : "新しい旅行"}</h3>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="panel-body">
          <label className="field-label">アイコン</label>
          <div className="emoji-picker">
            {ICON_CHOICES.map((em) => (
              <button
                key={em}
                className={`emoji-choice${emoji === em ? " selected" : ""}`}
                onClick={() => setEmoji(em)}
                type="button"
              >{em}</button>
            ))}
          </div>

          <label className="field-label">旅行名</label>
          <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="例:ハワイ家族旅行" />

          <label className="field-label">行き先</label>
          <input className="field-input" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="例:ホノルル(ハワイ)" />

          <div className="field-row">
            <div>
              <label className="field-label">開始日</label>
              <input type="date" className="field-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="field-label">終了日</label>
              <input type="date" className="field-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <label className="field-label">国内旅行?海外旅行?</label>
          <div className="tz-toggle">
            <button className={`tz-btn${!isInternational ? " active" : ""}`} onClick={() => setIsInternational(false)}>国内旅行</button>
            <button className={`tz-btn${isInternational ? " active" : ""}`} onClick={() => setIsInternational(true)}>🌍 海外旅行</button>
          </div>

          {isInternational && (
            <>
              <label className="field-label">国・都市から自動計算(任意)</label>
              <select
                className="field-input"
                defaultValue=""
                onChange={(e) => {
                  if (!e.target.value) return;
                  setTimeDiffHours(String(computeTimeDiffHours(e.target.value, startDate)));
                }}
              >
                <option value="">選択してください</option>
                {CITY_TIMEZONES.map((c) => (
                  <option key={c.tz} value={c.tz}>{c.label}</option>
                ))}
              </select>
              <div className="field-hint">選ぶと、下の時差の欄に自動で数値が入ります(夏時間も考慮されます)。必要なら数値を直接書き換えても構いません。</div>

              <label className="field-label">現地との時差(任意)</label>
              <input
                type="number" step="0.5" className="field-input"
                value={timeDiffHours} onChange={(e) => setTimeDiffHours(e.target.value)}
                placeholder="例:日本より1時間遅い→ -1"
              />
              <div className="field-hint">現地の時計が日本より遅れていればマイナス、進んでいればプラスで入力してください(未入力なら時差なし扱い)</div>
            </>
          )}

          <label className="field-label">参加メンバー</label>
          <div className="add-inline" style={{ alignItems: "center" }}>
            <label className="member-avatar-btn">
              {memberPhoto ? <img src={memberPhoto} alt="" /> : <Users size={16} style={{ opacity: 0.4 }} />}
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
            </label>
            <input
              className="field-input" value={memberInput}
              onChange={(e) => setMemberInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addMember()}
              placeholder="名前を入力"
            />
            <button className="btn-mini" onClick={addMember} type="button"><Plus size={14} /></button>
          </div>
          <div className="field-hint">丸いアイコンをタップすると写真を選べます(任意)。追加したメンバーの名前や写真は、下の一覧からいつでも変更できます</div>
          <div className="card-list" style={{ marginTop: 8 }}>
            {members.map((m, i) => (
              <div className="reservation-item" key={m.id || i}>
                <label className="member-avatar-btn" style={{ width: 34, height: 34 }}>
                  <MemberAvatar member={m} size={34} />
                  <input
                    type="file" accept="image/*" style={{ display: "none" }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const data = await readImageCompressed(file, 160);
                        setMembers(members.map((x, idx) => (idx === i ? { ...x, photo: data } : x)));
                      } catch (err) { /* 失敗時は何もしない */ }
                    }}
                  />
                </label>
                <input
                  className="field-input" value={m.name}
                  onChange={(e) => setMembers(members.map((x, idx) => (idx === i ? { ...x, name: e.target.value } : x)))}
                />
                <button className="icon-btn faint" type="button" onClick={() => setMembers(members.filter((_, idx) => idx !== i))}>
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>

          <label className="field-label">地図リンク先</label>
          <div className="tz-toggle">
            <button className={`tz-btn${mapProvider === "google" ? " active" : ""}`} onClick={() => setMapProvider("google")} type="button">Googleマップ</button>
            <button className={`tz-btn${mapProvider === "citymapper" ? " active" : ""}`} onClick={() => setMapProvider("citymapper")} type="button">Citymapper</button>
          </div>
          <div className="field-hint">場所をタップしたときに開く地図アプリです。Citymapperは公共交通機関が充実した都市向けです(パリなど)。</div>

          <label className="field-label">合言葉(任意)</label>
          <input className="field-input" placeholder="例:hawaii2026" value={passcode} onChange={(e) => setPasscode(e.target.value)} />
          <div className="field-hint">
            合言葉を設定すると、旅行一覧では「🔒 ロック中の旅行」とだけ表示され、合言葉を知っている人だけが開けます。
            空欄なら誰でも開けます。(簡易的な仕組みのため、大切な情報の保護には向きません)
          </div>
        </div>
        <div className="panel-footer">
          <button className="btn-primary full" disabled={!canSave} onClick={handleSave}>
            {isEdit ? "保存する" : "この内容で作成"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================== 予定フォーム ============================== */
function ScheduleForm({ initial, trip, onSave, onCancel }) {
  const intl = trip.isInternational && trip.timeDiffHours;
  const [time, setTime] = useState(initial?.time || "");
  const [category, setCategory] = useState(initial?.category || "観光");
  const [timeZone, setTimeZone] = useState(initial?.timeZone || "jst");
  const [title, setTitle] = useState(initial?.title || "");
  const [location, setLocation] = useState(initial?.location || "");
  const [endTime, setEndTime] = useState(initial?.endTime || "");
  const [arrivalLocation, setArrivalLocation] = useState(initial?.arrivalLocation || "");
  const [endDayOffset, setEndDayOffset] = useState(initial?.endDayOffset ?? 0);
  const [arrivalIsLocalTime, setArrivalIsLocalTime] = useState(initial?.arrivalIsLocalTime || false);
  const [reservationNumber, setReservationNumber] = useState(initial?.reservationNumber || "");
  const [memo, setMemo] = useState(initial?.memo || "");
  const [coord, setCoord] = useState(typeof initial?.lat === "number" ? `${initial.lat}, ${initial.lng}` : "");

  const canSave = time && title.trim();

  const save = () => {
    if (!canSave) return;
    onSave({
      id: initial?.id || newId(),
      time, endTime: endTime || undefined, endDayOffset: endTime ? Number(endDayOffset) : undefined,
      title: title.trim(), category, location, arrivalLocation,
      arrivalIsLocalTime: endTime ? arrivalIsLocalTime : undefined,
      memo, reservationNumber, timeZone: intl ? timeZone : "jst",
      ...(() => {
        const m = coord.split(",").map((x) => Number(x.trim()));
        return (m.length === 2 && !isNaN(m[0]) && !isNaN(m[1])) ? { lat: m[0], lng: m[1] } : {};
      })(),
    });
  };

  return (
    <div className="mini-form">
      <label className="field-label">開始時刻</label>
      <input type="time" className="field-input" value={time} onChange={(e) => setTime(e.target.value)} />

      <label className="field-label">カテゴリ</label>
      <select className="field-input" value={category} onChange={(e) => setCategory(e.target.value)}>
        {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.key}</option>)}
      </select>

      {intl ? (
        <>
          <label className="field-label">この時刻はどっち?</label>
          <div className="tz-toggle">
            <button className={`tz-btn${timeZone === "jst" ? " active" : ""}`} onClick={() => setTimeZone("jst")}>🇯🇵 日本時間</button>
            <button className={`tz-btn${timeZone === "local" ? " active" : ""}`} onClick={() => setTimeZone("local")}>📍 現地時間</button>
          </div>
        </>
      ) : null}

      <label className="field-label">予定名</label>
      <input className="field-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例:ダイヤモンドヘッド登山" />

      <label className="field-label">出発場所(任意)</label>
      <input className="field-input" value={location} onChange={(e) => setLocation(e.target.value)} />

      <label className="field-label">到着時刻(任意)</label>
      <input type="time" className="field-input" value={endTime} onChange={(e) => setEndTime(e.target.value)} />

      <label className="field-label">到着場所(任意)</label>
      <input className="field-input" value={arrivalLocation} onChange={(e) => setArrivalLocation(e.target.value)} />

      {endTime && (
        <>
          <label className="field-label">到着日</label>
          <select className="field-input" value={endDayOffset} onChange={(e) => setEndDayOffset(e.target.value)}>
            <option value={0}>当日</option>
            <option value={1}>翌日</option>
            <option value={2}>2日後</option>
          </select>
          {intl ? (
            <label className="checkbox-label">
              <input type="checkbox" checked={arrivalIsLocalTime} onChange={(e) => setArrivalIsLocalTime(e.target.checked)} />
              到着時刻は現地時間
            </label>
          ) : null}
        </>
      )}

      <label className="field-label">予約番号(任意)</label>
      <input className="field-input" value={reservationNumber} onChange={(e) => setReservationNumber(e.target.value)} />

      <label className="field-label">メモ(任意)</label>
      <input className="field-input" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="例:徒歩15分、乗り換え案内など" />
      <div className="field-hint">移動の所要時間の目安などは、ここに手入力しておくと予定カードに表示されます</div>

      <label className="field-label">緯度・経度(任意)</label>
      <input className="field-input" placeholder="例:48.8584, 2.2945" value={coord} onChange={(e) => setCoord(e.target.value)} />
      <div className="field-hint">地図タブに出したいときに使います。空欄でも「場所の位置を自動で調べる」で埋められます</div>

      <div className="form-actions">
        <button className="btn-mini full" disabled={!canSave} onClick={save}>保存する</button>
        <button className="btn-secondary full" onClick={onCancel}>やめる</button>
      </div>
    </div>
  );
}

/* ============================== 予定カード ============================== */
function ScheduleCard({ item, trip, onEdit, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const cat = catInfo(item.category);
  const intl = trip.isInternational && trip.timeDiffHours;

  return (
    <div className="schedule-item clickable" onClick={() => !confirming && onEdit()}>
      <div className="schedule-time-col">
        {intl && <span className="tz-pin">{item.timeZone === "local" ? "📍" : "🇯🇵"}</span>}
        <span>{item.time}</span>
        {item.endTime && (
          <span className="schedule-time-sub">
            ↓ {item.endDayOffset === 1 ? "翌日 " : item.endDayOffset === 2 ? "2日後 " : ""}
            {item.endTime}{item.arrivalIsLocalTime ? "(現地)" : ""}
          </span>
        )}
      </div>
      <div className="schedule-main">
        <div className="schedule-top">
          <span className="cat-badge" style={{ background: cat.bg, color: cat.fg }}>{item.category}</span>
          <span className="schedule-title">{item.title}</span>
        </div>
        <div className="schedule-meta">
          {item.location && (
            <a className="meta-link" href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); openLocationLink(item.location, trip.mapProvider, item); }}>
              <MapPin size={11} />{item.location}<ExternalLink size={9} />
            </a>
          )}
          {item.arrivalLocation && (
            <a className="meta-link" href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); openLocationLink(item.arrivalLocation, trip.mapProvider); }}>
              <ArrowRight size={11} />{item.arrivalLocation}<ExternalLink size={9} />
            </a>
          )}
          {item.reservationNumber && <span className="meta-tag"><Ticket size={11} />{item.reservationNumber}</span>}
          {item.memo && <span className="meta-memo">{item.memo}</span>}
        </div>
        {confirming && (
          <div style={{ marginTop: 8 }} onClick={(e) => e.stopPropagation()}>
            <ConfirmDelete message="削除しますか?" onConfirm={onDelete} onCancel={() => setConfirming(false)} />
          </div>
        )}
      </div>
      {!confirming && (
        <button className="icon-btn faint" onClick={(e) => { e.stopPropagation(); setConfirming(true); }}>
          <X size={16} />
        </button>
      )}
    </div>
  );
}

/* ============================== 日程タブ ============================== */
function ScheduleTab({ trip, updateTrip }) {
  const allDates = useMemo(() => dateRange(trip.startDate, trip.endDate), [trip.startDate, trip.endDate]);
  const [activeDate, setActiveDate] = useState(allDates[0]);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const days = trip.days || {};
  const dayItems = days[activeDate] || [];

  // 前日から続く到着(carryover)
  let carryover = null;
  for (const [d, items] of Object.entries(days)) {
    for (const it of items) {
      if (it.endTime && it.endDayOffset > 0 && addDaysStr(d, it.endDayOffset) === activeDate) {
        carryover = it;
      }
    }
  }

  // その日のtodo(日付指定あり)
  const todosForDay = [];
  TODO_PHASES.forEach((ph) => {
    (trip.todos?.[ph.key] || []).forEach((t) => {
      if (t.date === activeDate) todosForDay.push({ ...t, phase: ph.key });
    });
  });

  const combined = [
    ...dayItems.map((it) => ({ kind: "schedule", ...it })),
    ...todosForDay.map((t) => ({ kind: "todo", ...t })),
  ].sort((a, b) => {
    const ta = a.kind === "schedule"
      ? jstTs(activeDate, a.time, a.timeZone, trip.timeDiffHours)
      : (a.time ? jstTs(activeDate, a.time, a.timeZone || "jst", trip.timeDiffHours) : Infinity);
    const tb = b.kind === "schedule"
      ? jstTs(activeDate, b.time, b.timeZone, trip.timeDiffHours)
      : (b.time ? jstTs(activeDate, b.time, b.timeZone || "jst", trip.timeDiffHours) : Infinity);
    return ta - tb;
  });

  const saveItem = (item) => {
    const list = days[activeDate] || [];
    const exists = list.some((i) => i.id === item.id);
    const newList = exists ? list.map((i) => (i.id === item.id ? item : i)) : [...list, item];
    updateTrip({ ...trip, days: { ...days, [activeDate]: newList } });
    setAdding(false);
    setEditingId(null);
  };
  const deleteItem = (id) => {
    const list = (days[activeDate] || []).filter((i) => i.id !== id);
    updateTrip({ ...trip, days: { ...days, [activeDate]: list } });
    setEditingId(null);
  };
  const toggleTodo = (todoItem) => {
    const phase = todoItem.phase;
    const list = trip.todos[phase].map((t) => (t.id === todoItem.id ? { ...t, checked: !t.checked } : t));
    updateTrip({ ...trip, todos: { ...trip.todos, [phase]: list } });
  };

  return (
    <div className="tab-content">
      <div className="day-tabs">
        {allDates.map((d, i) => (
          <button key={d} className={`day-tab${d === activeDate ? " active" : ""}`} onClick={() => { setActiveDate(d); setAdding(false); setEditingId(null); }}>
            Day{i + 1}<span>{fmtDateShort(d)}</span>
          </button>
        ))}
      </div>

      {carryover && (
        <div className="carryover-card">
          🛬 前日から:{carryover.title} 到着 ({carryover.endTime}{carryover.arrivalIsLocalTime ? "(現地)" : ""})
        </div>
      )}

      <div className="card-list">
        {combined.length === 0 && !carryover && (
          <div className="empty-state"><Calendar size={26} />この日の予定はまだありません</div>
        )}
        {combined.map((item) =>
          item.kind === "schedule" ? (
            editingId === item.id ? (
              <ScheduleForm key={item.id} initial={item} trip={trip} onSave={saveItem} onCancel={() => setEditingId(null)} />
            ) : (
              <ScheduleCard key={item.id} item={item} trip={trip} onEdit={() => setEditingId(item.id)} onDelete={() => deleteItem(item.id)} />
            )
          ) : (
            <div key={item.id} className={`schedule-item todo-linked${item.checked ? " checked" : ""}`}>
              <div className="schedule-time-col">
                {trip.isInternational && trip.timeDiffHours && item.time && <span className="tz-pin">{item.timeZone === "local" ? "📍" : "🇯🇵"}</span>}
                <span>{item.time || ""}</span>
              </div>
              <div className="schedule-main">
                <div className="schedule-top">
                  <span className="cat-badge todo-badge"><Check size={10} />やること</span>
                  <span className="schedule-title">✅ {item.text}</span>
                </div>
                {item.location && (
                  <div className="schedule-meta">
                    <a className="meta-link" href="#" onClick={(e) => { e.preventDefault(); openLocationLink(item.location, trip.mapProvider, item); }}><MapPin size={11} />{item.location}<ExternalLink size={9} /></a>
                  </div>
                )}
              </div>
              <button className="check-circle" style={{ width: 26, height: 26 }} onClick={() => toggleTodo(item)}>
                {item.checked && <Check size={14} />}
              </button>
            </div>
          )
        )}
      </div>

      {adding ? (
        <ScheduleForm trip={trip} onSave={saveItem} onCancel={() => setAdding(false)} />
      ) : (
        <button className="btn-mini full" onClick={() => setAdding(true)}><Plus size={14} />予定を追加</button>
      )}
    </div>
  );
}

/* ============================== やることタブ ============================== */
function TodoForm({ trip, initial, phase, onSave, onCancel }) {
  const intl = trip.isInternational && trip.timeDiffHours;
  const [text, setText] = useState(initial?.text || "");
  const [expanded, setExpanded] = useState(!!(initial?.date));
  const [date, setDate] = useState(initial?.date || "");
  const [time, setTime] = useState(initial?.time || "");
  const [timeZone, setTimeZone] = useState(initial?.timeZone || "jst");
  const [location, setLocation] = useState(initial?.location || "");

  const save = () => {
    if (!text.trim()) return;
    onSave({
      id: initial?.id || newId(),
      text: text.trim(), checked: initial?.checked || false,
      date: expanded ? (date || undefined) : undefined,
      time: expanded ? (time || undefined) : undefined,
      location: expanded ? (location || undefined) : undefined,
      timeZone: expanded ? (intl ? timeZone : "jst") : undefined,
    });
  };

  return (
    <div className="mini-form">
      <input className="field-input" placeholder="やることを入力" value={text} onChange={(e) => setText(e.target.value)} />
      {!expanded ? (
        <button className="link-btn" onClick={() => setExpanded(true)} type="button" style={{ alignSelf: "flex-start" }}>日時・場所を追加</button>
      ) : (
        <>
          <div className="field-row">
            <div>
              <label className="field-label">日付</label>
              <input type="date" className="field-input" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label className="field-label">時刻</label>
              <input type="time" className="field-input" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          {intl ? (
            <div className="tz-toggle" style={{ marginTop: 6 }}>
              <button className={`tz-btn${timeZone === "jst" ? " active" : ""}`} onClick={() => setTimeZone("jst")} type="button">🇯🇵 日本時間</button>
              <button className={`tz-btn${timeZone === "local" ? " active" : ""}`} onClick={() => setTimeZone("local")} type="button">📍 現地時間</button>
            </div>
          ) : null}
          <label className="field-label">場所</label>
          <input className="field-input" value={location} onChange={(e) => setLocation(e.target.value)} />
          <button className="link-btn" onClick={() => { setExpanded(false); setDate(""); setTime(""); setLocation(""); }} type="button" style={{ alignSelf: "flex-start" }}>日時・場所をクリア</button>
        </>
      )}
      <div className="form-actions">
        <button className="btn-mini full" onClick={save}>保存する</button>
        <button className="btn-secondary full" onClick={onCancel}>やめる</button>
      </div>
    </div>
  );
}

function TodoTab({ trip, updateTrip }) {
  const [phase, setPhase] = useState("pre");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const list = trip.todos?.[phase] || [];

  const setList = (newList) => updateTrip({ ...trip, todos: { ...trip.todos, [phase]: newList } });
  const save = (item) => {
    const exists = list.some((i) => i.id === item.id);
    setList(exists ? list.map((i) => (i.id === item.id ? item : i)) : [...list, item]);
    setAdding(false); setEditingId(null);
  };
  const toggle = (id) => setList(list.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));
  const remove = (id) => { setList(list.filter((i) => i.id !== id)); setDeletingId(null); };

  return (
    <div className="tab-content">
      <div className="day-tabs">
        {TODO_PHASES.map((p) => (
          <button key={p.key} className={`day-tab${phase === p.key ? " active" : ""}`} onClick={() => { setPhase(p.key); setAdding(false); setEditingId(null); }}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="card-list">
        {list.length === 0 && <div className="empty-state"><ListChecks size={26} />タスクはまだありません</div>}
        {list.map((item) =>
          editingId === item.id ? (
            <TodoForm key={item.id} trip={trip} initial={item} phase={phase} onSave={save} onCancel={() => setEditingId(null)} />
          ) : deletingId === item.id ? (
            <div className="mini-form" key={item.id}>
              <ConfirmDelete message="削除しますか?" onConfirm={() => remove(item.id)} onCancel={() => setDeletingId(null)} />
            </div>
          ) : (
            <div className={`check-row${item.checked ? " checked" : ""}`} key={item.id}>
              <button className="check-circle" onClick={() => toggle(item.id)}>{item.checked && <Check size={14} />}</button>
              <div className="check-text-col clickable" onClick={() => setEditingId(item.id)}>
                <span className="check-text">{item.text}</span>
                {item.date && (
                  <div className="todo-date-badge">
                    <Calendar size={11} />{fmtDateShort(item.date)}{item.time ? ` ${item.time}` : ""}{item.location ? ` ・ ${item.location}` : ""}
                  </div>
                )}
              </div>
              <button className="icon-btn faint" onClick={() => setDeletingId(item.id)}><X size={16} /></button>
            </div>
          )
        )}
      </div>

      {adding ? (
        <TodoForm trip={trip} phase={phase} onSave={save} onCancel={() => setAdding(false)} />
      ) : (
        <button className="btn-mini full" onClick={() => setAdding(true)}><Plus size={14} />追加</button>
      )}
    </div>
  );
}

/* ============================== 行きたいところタブ ============================== */
function WishlistTab({ trip, updateTrip }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [coord, setCoord] = useState("");
  const [editCoord, setEditCoord] = useState("");
  const [icon, setIcon] = useState("🌐");
  const [editIcon, setEditIcon] = useState("🌐");
  const [country, setCountry] = useState("");
  const [editCountry, setEditCountry] = useState("");
  const [memo, setMemo] = useState("");
  const [editMemo, setEditMemo] = useState("");
  const [photo, setPhoto] = useState(null);
  const [editPhoto, setEditPhoto] = useState(null);
  const [filterCountry, setFilterCountry] = useState(null);   // 絞り込み中の国
  const [filterIcon, setFilterIcon] = useState(null);         // 絞り込み中の種類

  const list = trip.wishlist || [];
  const setList = (l) => updateTrip({ ...trip, wishlist: l });

  // 登録済みの国を候補として集める
  const countries = [...new Set(list.map((w) => w.country).filter(Boolean))];
  // 実際に使われている種類だけを絞り込みボタンに出す
  const usedIcons = [...new Set(list.map((w) => w.icon || "🌐"))];

  // 絞り込み後の一覧(国と種類は組み合わせ可)
  const shown = list.filter((w) =>
    (!filterCountry || w.country === filterCountry) &&
    (!filterIcon || (w.icon || "🌐") === filterIcon)
  );

  // 「48.8584, 2.2945」のような文字列を緯度・経度に変換する
  const parseCoord = (text) => {
    const m = (text || "").split(",").map((x) => Number(x.trim()));
    if (m.length === 2 && !isNaN(m[0]) && !isNaN(m[1])) return { lat: m[0], lng: m[1] };
    return {};
  };

  const add = () => {
    if (!name.trim()) return;
    setList([...list, { id: newId(), name: name.trim(), url: url.trim(), icon, country: country.trim(), memo: memo.trim(), photo, ...parseCoord(coord) }]);
    setName(""); setUrl(""); setCoord(""); setIcon("🌐"); setCountry(""); setMemo(""); setPhoto(null);
  };

  const startEdit = (item) => {
    setEditingId(item.id); setEditName(item.name); setEditUrl(item.url || "");
    setEditCoord(typeof item.lat === "number" ? `${item.lat}, ${item.lng}` : "");
    setEditIcon(item.icon || "🌐");
    setEditCountry(item.country || "");
    setEditMemo(item.memo || "");
    setEditPhoto(item.photo || null);
  };
  const saveEdit = () => {
    if (!editName.trim()) return;
    setList(list.map((w) => (w.id === editingId ? { ...w, name: editName.trim(), url: editUrl.trim(), icon: editIcon, country: editCountry.trim(), memo: editMemo.trim(), photo: editPhoto, ...parseCoord(editCoord) } : w)));
    setEditingId(null);
  };
  const remove = (id) => { setList(list.filter((w) => w.id !== id)); setDeletingId(null); };

  const pickPhoto = async (e, setter) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { setter(await readImageCompressed(file)); } catch (err) { /* 読み込み失敗時は何もしない */ }
  };

  // URLが入っていればそれを開く。無ければ場所名で地図を検索する。
  const openPlace = (item) => {
    if (item.url) { window.open(item.url, "_blank"); return; }
    openLocationLink(item.name, trip.mapProvider, item);
  };

  return (
    <div className="tab-content">
      <div className="mini-form">
        <label className="field-label">種類</label>
        <div className="wish-icon-picker">
          {WISH_ICONS.map((w) => (
            <button
              key={w.icon} type="button" title={w.label}
              className={`wish-icon-choice${icon === w.icon ? " selected" : ""}`}
              onClick={() => setIcon(w.icon)}
            >{w.icon}</button>
          ))}
        </div>

        <label className="field-label">場所の名前</label>
        <input className="field-input" placeholder="名前(例:サント・シャペル)" value={name} onChange={(e) => setName(e.target.value)} />
        <label className="field-label">国・エリア(任意)</label>
        <input className="field-input" placeholder="例:フランス" value={country} onChange={(e) => setCountry(e.target.value)} list="wish-country-list" />
        <datalist id="wish-country-list">
          {countries.map((c) => <option key={c} value={c} />)}
        </datalist>

        <label className="field-label">地図のURL(任意)</label>
        <input className="field-input" placeholder="地図のURLを貼り付け" value={url} onChange={(e) => setUrl(e.target.value)} />
        <div className="field-hint">URLを空欄にすると、場所の名前から自動で地図を検索して開きます</div>
        <label className="field-label">緯度・経度(任意)</label>
        <input className="field-input" placeholder="例:48.8584, 2.2945" value={coord} onChange={(e) => setCoord(e.target.value)} />
        <div className="field-hint">地図タブに出したいときに使います。空欄でも「場所の位置を自動で調べる」で埋められます</div>

        <label className="field-label">メモ(任意)</label>
        <textarea className="field-input" rows={2} placeholder="例:予約が必要、日曜休み" value={memo} onChange={(e) => setMemo(e.target.value)} />

        <label className="field-label">写真(任意)</label>
        <input type="file" accept="image/*" className="field-input" onChange={(e) => pickPhoto(e, setPhoto)} />
        {photo && (
          <>
            <img src={photo} alt="" className="wish-photo-preview" />
            <button className="link-btn danger" style={{ alignSelf: "flex-start" }} onClick={() => setPhoto(null)}>写真を削除</button>
          </>
        )}

        <button className="btn-mini full" onClick={add}><Plus size={14} />行きたいところを追加</button>
      </div>

      {(countries.length > 0 || usedIcons.length > 1) && (
        <div className="wish-filter">
          {countries.length > 0 && (
            <div className="wish-filter-row">
              <span className="wish-filter-label">国・エリアで絞り込む</span>
              {countries.map((c) => (
                <button
                  key={c}
                  className={`wish-chip${filterCountry === c ? " on" : ""}`}
                  onClick={() => setFilterCountry(filterCountry === c ? null : c)}
                >{c}</button>
              ))}
            </div>
          )}
          {usedIcons.length > 1 && (
            <div className="wish-filter-row">
              <span className="wish-filter-label">種類で絞り込む</span>
              {usedIcons.map((ic) => (
                <button
                  key={ic}
                  className={`wish-chip${filterIcon === ic ? " on" : ""}`}
                  onClick={() => setFilterIcon(filterIcon === ic ? null : ic)}
                >{ic}</button>
              ))}
            </div>
          )}
          {(filterCountry || filterIcon) && (
            <button className="link-btn" style={{ alignSelf: "flex-start" }} onClick={() => { setFilterCountry(null); setFilterIcon(null); }}>
              絞り込みを解除({shown.length}件)
            </button>
          )}
        </div>
      )}

      <div className="card-list">
        {list.length === 0 && <div className="empty-state"><Heart size={26} />行きたいところはまだありません</div>}
        {list.length > 0 && shown.length === 0 && <div className="empty-state">条件に合う場所はありません</div>}
        {shown.map((item) =>
          editingId === item.id ? (
            <div className="mini-form" key={item.id}>
              <label className="field-label">種類</label>
              <div className="wish-icon-picker">
                {WISH_ICONS.map((w) => (
                  <button
                    key={w.icon} type="button" title={w.label}
                    className={`wish-icon-choice${editIcon === w.icon ? " selected" : ""}`}
                    onClick={() => setEditIcon(w.icon)}
                  >{w.icon}</button>
                ))}
              </div>

              <label className="field-label">場所の名前</label>
              <input className="field-input" value={editName} onChange={(e) => setEditName(e.target.value)} />
              <label className="field-label">国・エリア(任意)</label>
              <input className="field-input" placeholder="例:フランス" value={editCountry} onChange={(e) => setEditCountry(e.target.value)} list="wish-country-list" />

              <label className="field-label">地図のURL(任意)</label>
              <input className="field-input" value={editUrl} onChange={(e) => setEditUrl(e.target.value)} />
              <label className="field-label">緯度・経度(任意)</label>
              <input className="field-input" placeholder="例:48.8584, 2.2945" value={editCoord} onChange={(e) => setEditCoord(e.target.value)} />

              <label className="field-label">メモ(任意)</label>
              <textarea className="field-input" rows={2} placeholder="例:予約が必要、日曜休み" value={editMemo} onChange={(e) => setEditMemo(e.target.value)} />

              <label className="field-label">写真(任意)</label>
              <input type="file" accept="image/*" className="field-input" onChange={(e) => pickPhoto(e, setEditPhoto)} />
              {editPhoto && (
                <>
                  <img src={editPhoto} alt="" className="wish-photo-preview" />
                  <button className="link-btn danger" style={{ alignSelf: "flex-start" }} onClick={() => setEditPhoto(null)}>写真を削除</button>
                </>
              )}

              <div className="form-actions">
                <button className="btn-mini full" onClick={saveEdit}>保存する</button>
                <button className="btn-secondary full" onClick={() => setEditingId(null)}>やめる</button>
              </div>
            </div>
          ) : deletingId === item.id ? (
            <div className="mini-form" key={item.id}>
              <ConfirmDelete message="削除しますか?" onConfirm={() => remove(item.id)} onCancel={() => setDeletingId(null)} />
            </div>
          ) : (
            <div className="reservation-item" key={item.id}>
              <div className="reservation-body clickable" style={{ cursor: "pointer" }} onClick={() => startEdit(item)}>
                <div className="reservation-name">
                  <span className="wish-item-icon">{item.icon || "🌐"}</span> {item.name}
                </div>
                {item.country && <div className="wish-country">{item.country}</div>}
                <div className="reservation-meta">
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); openPlace(item); }}
                  >
                    <MapPin size={11} />地図で開く<ExternalLink size={9} />
                  </a>
                </div>
                {item.memo && <div className="wish-memo">{item.memo}</div>}
                {item.photo && <img src={item.photo} alt="" className="wish-photo" />}
              </div>
              <button className="icon-btn faint" onClick={() => setDeletingId(item.id)}><X size={16} /></button>
            </div>
          )
        )}
      </div>
    </div>
  );
}

/* ============================== 予約タブ ============================== */
function ReservationTab({ trip, updateTrip }) {
  const [category, setCategory] = useState("フライト");
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [link, setLink] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const list = trip.reservations || [];
  const add = () => {
    if (!name.trim()) return;
    updateTrip({ ...trip, reservations: [...list, { id: newId(), category, name: name.trim(), number, link }] });
    setName(""); setNumber(""); setLink("");
  };
  const remove = (id) => {
    updateTrip({ ...trip, reservations: list.filter((r) => r.id !== id) });
    setDeletingId(null);
  };

  return (
    <div className="tab-content">
      <div className="mini-form">
        <label className="field-label">カテゴリ</label>
        <select className="field-input" value={category} onChange={(e) => setCategory(e.target.value)}>
          {RESV_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <label className="field-label">名称</label>
        <input className="field-input" placeholder="名称(例:ANA123便 / ○○ホテル)" value={name} onChange={(e) => setName(e.target.value)} />
        <label className="field-label">予約番号(任意)</label>
        <input className="field-input" placeholder="予約番号(任意)" value={number} onChange={(e) => setNumber(e.target.value)} />
        <label className="field-label">リンク(任意)</label>
        <input className="field-input" placeholder="リンク(任意)" value={link} onChange={(e) => setLink(e.target.value)} />
        <button className="btn-mini full" onClick={add}><Plus size={14} />予約を追加</button>
      </div>

      <div className="card-list">
        {list.length === 0 && <div className="empty-state"><Ticket size={26} />予約情報はまだありません</div>}
        {list.map((r) =>
          deletingId === r.id ? (
            <div className="mini-form" key={r.id}>
              <ConfirmDelete message="削除しますか?" onConfirm={() => remove(r.id)} onCancel={() => setDeletingId(null)} />
            </div>
          ) : (
            <div className="reservation-item" key={r.id}>
              <div className="reservation-body">
                <div className="reservation-name">{r.name}</div>
                <div className="reservation-meta">
                  <span>{r.category}</span>
                  {r.number && <span>{r.number}</span>}
                  {r.link && <a href={r.link} target="_blank" rel="noreferrer"><ExternalLink size={11} />リンク</a>}
                </div>
              </div>
              <button className="icon-btn faint" onClick={() => setDeletingId(r.id)}><X size={16} /></button>
            </div>
          )
        )}
      </div>
    </div>
  );
}

/* ============================== 地図タブ ============================== */
function MapTab({ trip, updateTrip }) {
  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const markersRef = useRef([]);
  const lineRef = useRef(null);
  const [busy, setBusy] = useState(false);

  // 日程の予定(座標つき)を時刻順に集める
  const schedulePoints = [];
  Object.entries(trip.days || {}).forEach(([date, items]) => {
    items.forEach((it) => {
      const place = it.location || it.arrivalLocation;
      if (!place) return;
      schedulePoints.push({
        name: it.title, place, date,
        sortTs: jstTs(date, it.time, it.timeZone, trip.timeDiffHours),
        lat: it.lat, lng: it.lng, kind: "schedule",
      });
    });
  });
  schedulePoints.sort((a, b) => a.sortTs - b.sortTs);
  schedulePoints.forEach((p, i) => { p.num = i + 1; });

  const wishPoints = (trip.wishlist || []).map((w) => ({
    name: w.name, place: w.name, lat: w.lat, lng: w.lng, kind: "wishlist", icon: w.icon || "🌐",
  }));

  const all = [...schedulePoints, ...wishPoints];
  const withCoords = all.filter((p) => typeof p.lat === "number" && typeof p.lng === "number");
  const missing = all.filter((p) => typeof p.lat !== "number" || typeof p.lng !== "number");

  // 地図を描画する(Googleマップ)
  useEffect(() => {
    if (!window.google || !window.google.maps || !mapRef.current) return;
    if (!mapObj.current) {
      mapObj.current = new window.google.maps.Map(mapRef.current, {
        center: { lat: 48.8566, lng: 2.3522 },
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
      });
      markersRef.current = [];
      lineRef.current = null;
    }
    const map = mapObj.current;

    // 既存のピンと線を消す
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    if (lineRef.current) { lineRef.current.setMap(null); lineRef.current = null; }

    const info = new window.google.maps.InfoWindow();

    withCoords.forEach((p) => {
      const isSchedule = p.kind === "schedule";
      const marker = new window.google.maps.Marker({
        position: { lat: p.lat, lng: p.lng },
        map,
        label: {
          text: isSchedule ? String(p.num) : (p.icon || "🌐"),
          color: "#ffffff",
          fontSize: isSchedule ? "12px" : "14px",
          fontWeight: "700",
        },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 13,
          fillColor: isSchedule ? "#3FA9E0" : "#FFB6B9",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });
      marker.addListener("click", () => {
        info.setContent(`<div style="font-size:13px;font-weight:700">${p.name}</div><div style="font-size:12px;opacity:0.7">${p.place}</div>`);
        info.open(map, marker);
      });
      markersRef.current.push(marker);
    });

    // 日程の予定を順番に線でつなぐ
    const path = schedulePoints
      .filter((p) => typeof p.lat === "number")
      .map((p) => ({ lat: p.lat, lng: p.lng }));
    if (path.length > 1) {
      lineRef.current = new window.google.maps.Polyline({
        path, map, strokeColor: "#3FA9E0", strokeWeight: 2, strokeOpacity: 0.6,
      });
    }

    if (withCoords.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      withCoords.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }));
      map.fitBounds(bounds, 50);
    }
  }, [JSON.stringify(withCoords.map((p) => [p.lat, p.lng, p.name]))]);

  // 座標が無い場所を自動で調べる
  const fillCoords = async () => {
    setBusy(true);
    const newDays = JSON.parse(JSON.stringify(trip.days || {}));
    for (const [date, items] of Object.entries(newDays)) {
      for (const it of items) {
        const place = it.location || it.arrivalLocation;
        if (!place || typeof it.lat === "number") continue;
        const c = await lookupCoords(place);
        if (c) { it.lat = c.lat; it.lng = c.lng; }
      }
    }
    const newWish = [...(trip.wishlist || [])];
    for (const w of newWish) {
      if (typeof w.lat === "number") continue;
      const c = await lookupCoords(w.name);
      if (c) { w.lat = c.lat; w.lng = c.lng; }
    }
    updateTrip({ ...trip, days: newDays, wishlist: newWish });
    setBusy(false);
  };

  return (
    <div className="tab-content">
      <div ref={mapRef} className="map-canvas" />

      <div className="map-legend">
        <span><i className="legend-dot" style={{ background: "#3FA9E0" }} />番号=日程の予定</span>
        <span><i className="legend-dot" style={{ background: "#FFB6B9" }} />絵文字=行きたいところ</span>
      </div>

      <button className="btn-mini full" onClick={fillCoords} disabled={busy}>
        {busy ? "調べています…" : "場所の位置を自動で調べる"}
      </button>
      <div className="field-hint">
        場所の名前から位置を自動で調べます。うまく見つからない場所は、日程や行きたいところの入力欄で
        緯度・経度を直接入力すると地図に出ます。
      </div>

      {missing.length > 0 && (
        <div className="mini-form">
          <div className="field-label" style={{ marginTop: 0 }}>まだ地図に出ていない場所</div>
          {missing.map((p, i) => (
            <div key={i} style={{ fontSize: 12, padding: "4px 0" }}>
              {p.name} <span className="coord-missing">座標なし</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================== 旅行詳細ページ ============================== */
const TABS = [
  { key: "schedule", label: "日程", icon: Calendar },
  { key: "packing", label: "持ち物", icon: Package },
  { key: "shopping", label: "買うもの", icon: ShoppingCart },
  { key: "todo", label: "やること", icon: ListChecks },
  { key: "reservation", label: "予約", icon: Ticket },
  { key: "wishlist", label: "行きたいところ", icon: Heart },
  { key: "map", label: "地図", icon: Map },
];

function TripDetail({ trip, updateTrip, onBack, onOpenDrawer, onDeleteTrip, onToggleArchive, showToast }) {
  const [tab, setTab] = useState("schedule");
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [showPdfPanel, setShowPdfPanel] = useState(false);

  return (
    <div className="content screen">
      <div className="detail-header">
        <button className="icon-btn" onClick={onBack}><ArrowLeft size={20} /></button>
        <div className="detail-title">
          <span className="detail-emoji">{trip.emoji}</span>
          <div>
            <div className="detail-name">{trip.name}</div>
            <div className="detail-sub"><MapPin size={11} />{trip.destination} ・ {fmtDateRange(trip.startDate, trip.endDate)}</div>
          </div>
        </div>
        <button className="icon-btn faint" onClick={() => setShowPdfPanel(true)}><Download size={18} /></button>
        <button className="icon-btn faint" onClick={() => setEditing(true)}><Pencil size={18} /></button>
        <button className="icon-btn faint" onClick={() => onToggleArchive(trip.id)}>{trip.archived ? <RotateCcw size={18} /> : <Archive size={18} />}</button>
        <button className="icon-btn faint" onClick={onOpenDrawer}><Menu size={18} /></button>
      </div>

      {trip.members?.length > 0 && (
        <div className="chip-row">
          <Users size={14} style={{ opacity: 0.5 }} />
          {trip.members.map((m, i) => <MemberChip key={m.id || i} member={m} />)}
        </div>
      )}

      <div className="tab-bar">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.key} className={`tab-btn${tab === t.key ? " active" : ""}`} onClick={() => setTab(t.key)}>
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "schedule" && <ScheduleTab trip={trip} updateTrip={updateTrip} />}
      {tab === "packing" && (
        <SimpleChecklistTab
          list={trip.packingList} setList={(l) => updateTrip({ ...trip, packingList: l })}
          placeholder="持ち物を入力(例:パスポート)" emptyText="持ち物はまだありません"
        />
      )}
      {tab === "shopping" && (
        <SimpleChecklistTab
          list={trip.shoppingList} setList={(l) => updateTrip({ ...trip, shoppingList: l })}
          placeholder="買うものを入力(例:お土産)" emptyText="現地で買いたいものはまだありません"
        />
      )}
      {tab === "todo" && <TodoTab trip={trip} updateTrip={updateTrip} />}
      {tab === "reservation" && <ReservationTab trip={trip} updateTrip={updateTrip} />}
      {tab === "wishlist" && <WishlistTab trip={trip} updateTrip={updateTrip} />}
      {tab === "map" && <MapTab trip={trip} updateTrip={updateTrip} />}

      <div style={{ textAlign: "center", marginTop: 12 }}>
        {confirmingDelete ? (
          <ConfirmDelete
            onConfirm={() => onDeleteTrip(trip.id)}
            onCancel={() => setConfirmingDelete(false)}
          />
        ) : (
          <button className="link-btn danger" onClick={() => setConfirmingDelete(true)}>この旅行を削除する</button>
        )}
      </div>

      {editing && (
        <TripFormPanel
          initial={trip}
          onClose={() => setEditing(false)}
          onSave={(t) => { updateTrip(t); setEditing(false); }}
        />
      )}

      {showPdfPanel && (
        <PdfExportPanel trip={trip} onClose={() => setShowPdfPanel(false)} showToast={showToast} />
      )}
    </div>
  );
}

function PdfExportPanel({ trip, onClose, showToast }) {
  const [items, setItems] = useState({ schedule: true, packing: true, shopping: true, todo: true });
  const [days, setDays] = useState(2);
  const anySelected = Object.values(items).some(Boolean);
  const toggle = (k) => setItems({ ...items, [k]: !items[k] });

  return (
    <div className="overlay" onClick={onClose}>
      <div className="panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <h3>出力する項目を選んでください</h3>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="panel-body">
          {[["schedule", "📅 日程"], ["packing", "🎒 持ち物"], ["shopping", "🛒 買うもの"], ["todo", "✅ やること"]].map(([k, label]) => (
            <label className="checkbox-label" key={k}>
              <input type="checkbox" checked={items[k]} onChange={() => toggle(k)} />
              {label}
            </label>
          ))}
          {items.schedule && (
            <>
              <label className="field-label">1ページに何日分載せる?</label>
              <div className="tz-toggle">
                {[1, 2, 3].map((n) => (
                  <button key={n} className={`tz-btn${days === n ? " active" : ""}`} onClick={() => setDays(n)}>{n}日</button>
                ))}
              </div>
              <div className="field-hint">予定が多い日がある場合は、少なめにすると崩れにくくなります</div>
            </>
          )}
        </div>
        <div className="panel-footer">
          <button
            className="btn-primary full"
            disabled={!anySelected}
            onClick={() => { showToast("このプレビュー環境では印刷を確認できません。公開後のページでは正しく動作します。"); onClose(); }}
          >
            この内容で出力する
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================== ドロワー(旅行一覧) ============================== */
function Drawer({ open, trips, onClose, onSelectTrip, onCreateNew, onToggleArchive }) {
  const [showArchived, setShowArchived] = useState(false);
  const today = todayStr();
  const upcoming = trips.filter((t) => !t.archived && t.endDate >= today).sort((a, b) => a.startDate.localeCompare(b.startDate));
  const past = trips.filter((t) => !t.archived && t.endDate < today).sort((a, b) => b.endDate.localeCompare(a.endDate));
  const archived = trips.filter((t) => t.archived);

  const renderCard = (t) => {
    const locked = isLocked(t);
    return (
      <div className="trip-card" key={t.id} onClick={() => onSelectTrip(t.id)}>
        <span className="trip-card-emoji">{locked ? "🔒" : t.emoji}</span>
        <div className="trip-card-body">
          {locked ? (
            <div className="trip-card-name">ロック中の旅行</div>
          ) : (
            <>
              <div className="trip-card-name">{t.name}</div>
              <div className="trip-card-dest"><MapPin size={10} />{t.destination}</div>
              <div className="trip-card-dates">{fmtDateRange(t.startDate, t.endDate)}</div>
            </>
          )}
        </div>
        {!locked && (
          <button className="icon-btn faint" onClick={(e) => { e.stopPropagation(); onToggleArchive(t.id); }}>
            {t.archived ? <RotateCcw size={16} /> : <Archive size={16} />}
          </button>
        )}
        <ChevronRight size={18} className="chevron" />
      </div>
    );
  };

  return (
    <>
      <div className={`drawer-overlay${open ? " show" : ""}`} onClick={onClose} />
      <div className={`drawer${open ? " open" : ""}`}>
        <div className="drawer-header">
          <h2>旅行一覧</h2>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="drawer-body">
          <button className="btn-primary full" onClick={onCreateNew}><Plus size={16} />旅行を追加</button>

          <div className="section">
            <div className="section-title">予定中</div>
            {upcoming.length === 0 && <div className="empty-state">予定中の旅行はありません</div>}
            {upcoming.map(renderCard)}
          </div>

          <div className="section">
            <div className="section-title">終わった旅行</div>
            {past.length === 0 && <div className="empty-state">終わった旅行はまだありません</div>}
            {past.map(renderCard)}
          </div>

          <button className="link-btn" onClick={() => setShowArchived(!showArchived)}>
            {showArchived ? "アーカイブ済みを隠す" : `アーカイブ済みを見る(${archived.length})`}
          </button>
          {showArchived && (
            <div className="section">
              {archived.length === 0 && <div className="empty-state">アーカイブ済みの旅行はありません</div>}
              {archived.map(renderCard)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ============================== ホーム画面 ============================== */
function Home({ trips, onOpenDrawer, onSelectTrip, onCreateNew }) {
  const today = todayStr();
  const active = trips
    .filter((t) => !t.archived && t.endDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];

  if (!active) {
    return (
      <div className="content screen">
        <div className="home-topbar">
          <button className="icon-btn" onClick={onOpenDrawer}><Menu size={22} /></button>
          <span className="home-topbar-title">旅のしおり</span>
          <span style={{ width: 22 }} />
        </div>
        <div className="hero-empty">
          <Sparkles size={34} />
          <h2>次の旅行を計画しよう</h2>
          <p>まだ予定中の旅行がありません</p>
          <button className="btn-primary" onClick={onCreateNew}><Plus size={16} />旅行を追加する</button>
        </div>
      </div>
    );
  }

  const daysLeft = Math.round((naiveTs(active.startDate, "00:00") - naiveTs(today, "00:00")) / 86400000);
  let countdownText;
  if (daysLeft > 0) countdownText = `あと${daysLeft}日`;
  else if (daysLeft === 0) countdownText = "今日から出発!";
  else countdownText = "旅行中!";

  // 次の予定(schedule + todo)を最大5件
  const now = nowNaiveTs();
  const upcomingItems = [];
  Object.entries(active.days || {}).forEach(([date, items]) => {
    items.forEach((it) => {
      const ts = jstTs(date, it.time, it.timeZone, active.timeDiffHours);
      if (ts >= now) upcomingItems.push({ kind: "schedule", date, ...it, sortTs: ts });
    });
  });
  TODO_PHASES.forEach((ph) => {
    (active.todos?.[ph.key] || []).forEach((t) => {
      if (t.date && t.time) {
        const ts = jstTs(t.date, t.time, t.timeZone || "jst", active.timeDiffHours);
        if (ts >= now) upcomingItems.push({ kind: "todo", ...t, sortTs: ts });
      }
    });
  });
  upcomingItems.sort((a, b) => a.sortTs - b.sortTs);
  const nextFive = upcomingItems.slice(0, 5);

  const pendingPacking = []; // packing not shown on home per spec (not required)
  const todayInTrip = today >= active.startDate && today <= active.endDate;
  const todoPhaseKey = todayInTrip ? "during" : "pre";
  const todoPhaseLabel = todayInTrip ? "やることリスト(旅行中)" : "やることリスト(旅行前)";
  const pendingTodos = (active.todos?.[todoPhaseKey] || []).filter((t) => !t.checked);
  const pendingShopping = (active.shoppingList || []).filter((s) => !s.checked);

  return (
    <div className="content screen">
      <div className="home-topbar">
        <button className="icon-btn" onClick={onOpenDrawer}><Menu size={22} /></button>
        <span className="home-topbar-title">旅のしおり</span>
        <span style={{ width: 22 }} />
      </div>

      <div className="home-hero" onClick={() => onSelectTrip(active.id)}>
        <div className="home-hero-emoji">{active.emoji}</div>
        <div className="home-hero-count">{countdownText}</div>
        <div className="home-hero-name">{active.name}</div>
        <div className="home-hero-dest"><MapPin size={12} />{active.destination}</div>
        <div className="home-hero-dates">{fmtDateRange(active.startDate, active.endDate)}</div>
      </div>

      <div className="section">
        <div className="section-title"><Calendar size={16} />次の予定</div>
        {nextFive.length === 0 && <div className="empty-state">予定はまだありません</div>}
        {nextFive.map((item, i) => {
          const cat = item.kind === "schedule" ? catInfo(item.category) : null;
          const isToday = item.date === today;
          const place = item.kind === "schedule" ? (item.location || item.arrivalLocation || "") : "";
          return (
            <a
              key={i} className="mini-item clickable" href="#"
              onClick={(e) => { e.preventDefault(); if (place) openLocationLink(place, active.mapProvider, item); }}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              {item.kind === "schedule" ? (
                <span className="cat-dot" style={{ background: cat.dot }} />
              ) : (
                <span className="cat-dot" style={{ background: "#C9CED6" }} />
              )}
              <div className="mini-item-body">
                <div className="mini-item-time-row">
                  {active.isInternational && active.timeDiffHours && item.time && (
                    <span className="tz-pin">{item.timeZone === "local" ? "📍" : "🇯🇵"}</span>
                  )}
                  <span className="mini-time">{item.time}</span>
                  {!isToday && <span className="mini-date-label">{fmtDateShort(item.date)}</span>}
                  {item.endTime && <span className="mini-time">→{item.endTime}</span>}
                </div>
                <div className="mini-title">{item.kind === "todo" ? `✅ ${item.text}` : item.title}</div>
                {item.location && <div className="mini-loc"><MapPin size={10} />{item.location}</div>}
              </div>
              <ChevronRight size={16} className="mini-arrow" />
            </a>
          );
        })}
      </div>

      <div className="section">
        <div className="section-title"><ListChecks size={16} />{todoPhaseLabel}</div>
        {pendingTodos.length === 0 && <div className="empty-state">未完了のタスクはありません</div>}
        {pendingTodos.map((t) => (
          <div className="mini-item" key={t.id}>
            <div className="mini-item-body"><div className="mini-title">{t.text}</div></div>
          </div>
        ))}
      </div>

      <div className="section">
        <div className="section-title"><ShoppingCart size={16} />買うものリスト</div>
        {pendingShopping.length === 0 && <div className="empty-state">買い忘れはなさそうです</div>}
        {pendingShopping.map((s) => (
          <div className="mini-item" key={s.id}>
            <div className="mini-item-body"><div className="mini-title">{s.text}</div></div>
          </div>
        ))}
      </div>

      <button className="btn-secondary full" onClick={() => onSelectTrip(active.id)}>このしおりを開く</button>
    </div>
  );
}

/* ============================== 合言葉の入力 ============================== */
function PasscodePanel({ trip, onUnlock, onClose }) {
  const [input, setInput] = useState("");
  const [wrong, setWrong] = useState(false);

  const submit = () => {
    if (input === trip.passcode) {
      unlockedIds.add(trip.id);
      onUnlock();
    } else {
      setWrong(true);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <h3>🔒 合言葉を入力</h3>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="panel-body">
          <div className="field-hint" style={{ fontSize: 12.5, opacity: 0.75 }}>
            この旅行は合言葉で保護されています。
          </div>
          <input
            className="field-input" type="password" placeholder="合言葉を入力"
            value={input}
            onChange={(e) => { setInput(e.target.value); setWrong(false); }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            autoFocus
          />
          {wrong && <div className="field-hint" style={{ color: "#C25B3E", fontWeight: 700 }}>合言葉が違います</div>}
        </div>
        <div className="panel-footer">
          <button className="btn-primary full" disabled={!input} onClick={submit}>開く</button>
        </div>
      </div>
    </div>
  );
}

/* ============================== ルート ============================== */
const TRIPS_DOC = doc(db, "appData", "trips");

export default function App() {
  const [trips, setTrips] = useState(null);   // null = 読み込み中
  const [view, setView] = useState("home");
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [toast, setToast] = useState("");
  const [saveError, setSaveError] = useState(false);
  const [lockedTrip, setLockedTrip] = useState(null);   // 合言葉の入力待ちの旅行

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const shrinkDone = useRef(false);

  // Firestoreをリアルタイム監視(家族の誰かの編集がすぐ反映される)
  useEffect(() => {
    const unsub = onSnapshot(
      TRIPS_DOC,
      (snap) => {
        const value = snap.exists() ? snap.data().value : [];
        const arr = Array.isArray(value) ? value : [];
        // 読み込むたびにID重複を直す(過去に作られた重複データの修復)
        const fixed = dedupeIds(arr).map(repairTrip);
        setTrips(fixed);

        // 初回だけ、大きすぎる画像を縮めて保存し直す(容量オーバー対策)
        if (!shrinkDone.current) {
          shrinkDone.current = true;
          shrinkTripImages(fixed).then((shrunk) => {
            if (shrunk) {
              setTrips(shrunk);
              setDoc(TRIPS_DOC, { value: stripUndefined(shrunk) }).catch(() => {});
            }
          });
        }
      },
      () => setTrips([])
    );
    return unsub;
  }, []);

  // 保存(書き込み)
  const persist = async (rawTrips) => {
    setTrips(rawTrips);
    // 未定義の項目を取り除いてから保存する
    const newTrips = stripUndefined(rawTrips);
    const size = new Blob([JSON.stringify(newTrips)]).size;
    const kb = Math.round(size / 1024);
    if (size > 950000) {
      setSaveError(`データが上限に近づいています(${kb}KB)。写真を減らすか小さくしてください`);
      return;
    }
    try {
      await setDoc(TRIPS_DOC, { value: newTrips });
      setSaveError(false);
    } catch (e) {
      // 原因が分かるよう、エラーの中身とデータ量をそのまま表示する
      const code = e?.code || "";
      const msg = e?.message || String(e);
      if (msg.includes("exceeds the maximum") || msg.includes("1048487")) {
        setSaveError(`データが大きすぎて保存できません(${kb}KB)。写真を減らしてください`);
      } else if (code === "permission-denied") {
        setSaveError("保存が許可されていません(Firestoreのルールをご確認ください)");
      } else {
        setSaveError(`保存できませんでした(${kb}KB / ${code || "不明"}:${msg.slice(0, 80)})`);
      }
    }
  };

  if (trips === null) {
    return (
      <div className="app-root">
        <style>{STYLES}</style>
        <div className="loading">読み込み中…</div>
      </div>
    );
  }

  const updateTrip = (updated) => persist(trips.map((t) => (t.id === updated.id ? updated : t)));
  const selectedTrip = trips.find((t) => t.id === selectedTripId);

  const handleSelectTrip = (id) => {
    const t = trips.find((x) => x.id === id);
    if (t && isLocked(t)) { setLockedTrip(t); setDrawerOpen(false); return; }
    setSelectedTripId(id); setView("detail"); setDrawerOpen(false);
  };
  const handleToggleArchive = (id) => persist(trips.map((t) => (t.id === id ? { ...t, archived: !t.archived } : t)));
  const handleDeleteTrip = (id) => { persist(trips.filter((t) => t.id !== id)); setView("home"); setSelectedTripId(null); };
  const handleCreateTrip = (t) => { persist([...trips, t]); setShowCreatePanel(false); handleSelectTrip(t.id); };

  return (
    <div className="app-root">
      <style>{STYLES}</style>
      {saveError && <div className="save-error">{typeof saveError === "string" ? saveError : "保存できませんでした。通信環境をご確認ください"}</div>}
      {toast && <div className="save-error">{toast}</div>}

      {view === "home" && (
        <Home trips={trips.filter((t) => !isLocked(t))} onOpenDrawer={() => setDrawerOpen(true)} onSelectTrip={handleSelectTrip} onCreateNew={() => setShowCreatePanel(true)} />
      )}
      {view === "detail" && selectedTrip && (
        <TripDetail
          trip={selectedTrip}
          updateTrip={updateTrip}
          onBack={() => setView("home")}
          onOpenDrawer={() => setDrawerOpen(true)}
          onDeleteTrip={handleDeleteTrip}
          onToggleArchive={handleToggleArchive}
          showToast={showToast}
        />
      )}

      <Drawer
        open={drawerOpen}
        trips={trips}
        onClose={() => setDrawerOpen(false)}
        onSelectTrip={handleSelectTrip}
        onCreateNew={() => { setDrawerOpen(false); setShowCreatePanel(true); }}
        onToggleArchive={handleToggleArchive}
      />

      {showCreatePanel && (
        <TripFormPanel onClose={() => setShowCreatePanel(false)} onSave={handleCreateTrip} />
      )}

      {lockedTrip && (
        <PasscodePanel
          trip={lockedTrip}
          onClose={() => setLockedTrip(null)}
          onUnlock={() => {
            setSelectedTripId(lockedTrip.id);
            setView("detail");
            setLockedTrip(null);
          }}
        />
      )}
    </div>
  );
}
