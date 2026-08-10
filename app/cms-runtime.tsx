"use client";

import { useEffect } from "react";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./cms-config";

export type CmsField = { key: string; kind: "text" | "image" | "link"; label: string; value: string; width?: number; height?: number };
type Override = { field_key: string; value: string };

function editableFields(): { fields: CmsField[]; apply: Record<string, (value: string) => void> } {
  const fields: CmsField[] = [];
  const apply: Record<string, (value: string) => void> = {};
  const root = document.body;
  const ignored = (el: Element | null) => !el || Boolean(el.closest("[data-cms-ignore],script,style,noscript"));
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode(node) {
    const parent = node.parentElement;
    const value = node.nodeValue?.trim() || "";
    return !value || ignored(parent) || parent?.closest(".page-liquid,.liquid-motion") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
  }});
  let textIndex = 0;
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const textNode = node as Text;
    const parent = textNode.parentElement;
    if (!parent) continue;
    const key = `text-${textIndex++}`;
    const raw = textNode.nodeValue || "";
    const leading = raw.match(/^\s*/)?.[0] || "";
    const trailing = raw.match(/\s*$/)?.[0] || "";
    const value = raw.trim();
    fields.push({ key, kind: "text", label: `${parent.tagName.toLowerCase()} · ${value.slice(0, 54)}`, value });
    apply[key] = (next) => { textNode.nodeValue = `${leading}${next}${trailing}`; };
  }
  [...root.querySelectorAll<HTMLImageElement>("img")].filter((img) => !ignored(img)).forEach((img, index) => {
    const key = `image-${index}`;
    fields.push({ key, kind: "image", label: img.alt || `Image ${index + 1}`, value: img.currentSrc || img.src, width: img.naturalWidth, height: img.naturalHeight });
    apply[key] = (next) => { img.src = next; img.removeAttribute("srcset"); };
  });
  [...root.querySelectorAll<HTMLAnchorElement>("a[href]")].filter((link) => !ignored(link)).forEach((link, index) => {
    const key = `link-${index}`;
    fields.push({ key, kind: "link", label: `Link · ${(link.textContent || link.href).trim().slice(0, 54)}`, value: link.getAttribute("href") || "" });
    apply[key] = (next) => { link.setAttribute("href", next); };
  });
  return { fields, apply };
}

export function CmsRuntime() {
  useEffect(() => {
    if (location.pathname.startsWith("/admin")) return;
    let cancelled = false;
    const pagePath = location.pathname || "/";
    const run = async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
      if (cancelled) return;
      const { fields, apply } = editableFields();
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/site_content?page_path=eq.${encodeURIComponent(pagePath)}&select=field_key,value`, { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } });
        if (response.ok) {
          const overrides = await response.json() as Override[];
          overrides.forEach((item) => apply[item.field_key]?.(item.value));
          fields.forEach((field) => { const saved = overrides.find((item) => item.field_key === field.key); if (saved) field.value = saved.value; });
        }
      } catch { /* Keep original content if the CMS is unavailable. */ }
      if (new URLSearchParams(location.search).has("cms-preview") && window.parent !== window) window.parent.postMessage({ type: "fresh-kind-cms-fields", pagePath, fields }, location.origin);
    };
    run();
    return () => { cancelled = true; };
  }, []);
  return null;
}

