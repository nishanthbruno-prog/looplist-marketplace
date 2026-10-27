import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bell,
  Bike,
  BookOpen,
  BriefcaseBusiness,
  Bot,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CircleHelp,
  Heart,
  LayoutDashboard,
  Loader2,
  LogIn,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sofa,
  Sparkles,
  Tag,
  UserRound,
  Video,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent, TouchEvent } from "react";
import { useLocation, useRoute } from "wouter";
import { toast } from "sonner";

type Category = "All" | "Home" | "Electronics" | "Vehicles" | "Fashion" | "Hobbies" | "Services";
type MediaAsset = { type: "image" | "video"; src: string };
type UserProfile = { phone: string; name: string };
type ChatMessage = { id: string; from: "seller" | "you"; text: string; time: string };
type AiReview = { summary: string; notes: string[]; confidence: string };
type Listing = {
  id: number;
  title: string;
  price: number;
  location: string;
  category: Exclude<Category, "All">;
  seller: string;
  sellerAvatar: string;
  image: string;
  media?: MediaAsset[];
  time: string;
  featured?: boolean;
  aiReviewed?: boolean;
  aiReviewSummary?: string;
  aiNotes?: string[];
  description: string;
};

const SAVED_KEY = "looplist-saved-ids";
const USER_KEY = "looplist-user";
const image = (id: string, width = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
const formatPrice = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

const listings: Listing[] = [
  { id: 1, title: "Oak dining set for slow Sundays", price: 18000, location: "Westside · 2 km", category: "Home", seller: "Maya Chen", sellerAvatar: image("photo-1494790108377-be9c29b29330", 120), image: image("photo-1617806118233-18e1de247200"), time: "12 min ago", featured: true, description: "Solid oak dining table with four matching chairs. A few honest marks from a well-loved home, but sturdy and ready for its next chapter." },
  { id: 2, title: "iPhone 13 · 128GB · Midnight", price: 39000, location: "Riverside · 4 km", category: "Electronics", seller: "Jordan Lee", sellerAvatar: image("photo-1500648767791-00dcc994a43e", 120), image: image("photo-1592750475338-74b7b21085ab"), time: "31 min ago", featured: true, description: "Unlocked iPhone 13 in midnight. Battery health 89%, always used with a case and screen protector. Includes the original box and a spare case." },
  { id: 3, title: "City bike, tuned and ready to ride", price: 24000, location: "North Park · 1 km", category: "Vehicles", seller: "Theo Adams", sellerAvatar: image("photo-1507003211169-0a1dd7228f2d", 120), image: image("photo-1571068316344-75bc76f77890"), time: "1 hr ago", description: "Lightweight commuter bike with recently serviced brakes and gears. Frame size medium. Includes a U-lock and front light." },
  { id: 4, title: "35mm film camera + two lenses", price: 16500, location: "Old Town · 3 km", category: "Hobbies", seller: "Nora Patel", sellerAvatar: image("photo-1534528741775-53994a69daeb", 120), image: image("photo-1516035069371-29a1b244cc32"), time: "2 hrs ago", description: "A beautiful, fully working film camera bundle for someone who wants to shoot with intention. Includes 50mm and 28mm lenses plus a carry pouch." },
  { id: 5, title: "Linen weekend tote · handmade", price: 4200, location: "Meadowview · 5 km", category: "Fashion", seller: "Amara Fields", sellerAvatar: image("photo-1544005313-94ddf0286df2", 120), image: image("photo-1553062407-98eeb64c6a62"), time: "3 hrs ago", description: "Natural linen tote with vegetable-tanned leather handles. Roomy enough for a weekend away, soft enough for every day." },
  { id: 6, title: "Vintage reading chair in moss green", price: 9500, location: "Hillcrest · 2 km", category: "Home", seller: "Sam Rivera", sellerAvatar: image("photo-1506794778202-cad84cf45f1d", 120), image: image("photo-1555041469-a586c61ea9bc"), time: "4 hrs ago", description: "Comfortable vintage armchair reupholstered in a rich moss green fabric. Great reading corner energy; selling because we moved." },
  { id: 7, title: "Noise-canceling headphones", price: 7500, location: "South Loop · 6 km", category: "Electronics", seller: "Priya Nair", sellerAvatar: image("photo-1531123897727-8f129e1688ce", 120), image: image("photo-1505740420928-5e560c06d30e"), time: "Yesterday", description: "Wireless over-ear headphones with great battery life and soft ear cushions. Fully tested and lightly used." },
  { id: 8, title: "Monstera plant · looking for a new window", price: 2800, location: "Cedar Grove · 3 km", category: "Hobbies", seller: "Eli Brooks", sellerAvatar: image("photo-1507003211169-0a1dd7228f2d", 120), image: image("photo-1614594975525-e45190c55d0b"), time: "Yesterday", description: "Healthy, happy monstera that has outgrown its current spot. Comes in the terracotta pot pictured." },
  { id: 9, title: "Friendly moving help by the hour", price: 3500, location: "Westside · 2 km", category: "Services", seller: "Cam Rivera", sellerAvatar: image("photo-1507003211169-0a1dd7228f2d", 120), image: image("photo-1581578731548-c64695cc6952"), time: "Today", description: "Careful, reliable moving help for local apartments, pickups, and small furniture jobs. Flexible weekend availability." },
];

const categories = [
  { name: "Home" as const, count: "1,240", icon: Sofa },
  { name: "Electronics" as const, count: "820", icon: Camera },
  { name: "Vehicles" as const, count: "560", icon: Bike },
  { name: "Fashion" as const, count: "430", icon: Tag },
  { name: "Hobbies" as const, count: "290", icon: BookOpen },
  { name: "Services" as const, count: "180", icon: BriefcaseBusiness },
];

const galleryFallbacks: Record<number, string[]> = {
  1: ["photo-1493663284031-b7e3aefcae8f", "photo-1555041469-a586c61ea9bc", "photo-1618221195710-dd6b41faaea6"],
  2: ["photo-1511707171634-5f897ff02aa9", "photo-1510557880182-3d4d3cba35a5", "photo-1523206489230-c012c64b2b48"],
  3: ["photo-1502744688674-c619d1586c9e", "photo-1485965120184-e220f721d03e", "photo-1558981806-ec527fa84c39"],
  4: ["photo-1452780212940-6f5c0d14d848", "photo-1510127034890-ba27508e9f1c", "photo-1500530855697-b586d89ba3ee"],
};

function getMedia(listing: Listing): MediaAsset[] {
  if (listing.media?.length) return listing.media;
  return [{ type: "image", src: listing.image }, ...(galleryFallbacks[listing.id] || []).map((id) => ({ type: "image" as const, src: image(id) }))];
}

function Brand() {
  return <a className="brand" href="/" aria-label="Looplist home"><span className="brand-mark"><Sparkles size={17} strokeWidth={2.6} /></span><span>looplist</span></a>;
}

function ListingCard({ listing, saved, onSave, onOpen }: { listing: Listing; saved: boolean; onSave: () => void; onOpen: () => void }) {
  return <article className="listing-card" onClick={onOpen}>
    <div className="listing-image-wrap"><img src={listing.image} alt={listing.title} loading="lazy" /><button className={`save-button ${saved ? "saved" : ""}`} aria-label={saved ? "Remove from saved" : "Save listing"} onClick={(event) => { event.stopPropagation(); onSave(); }}><Heart size={17} fill={saved ? "currentColor" : "none"} /></button>{listing.featured && <span className="featured-tag">Featured</span>}{listing.aiReviewed && <span className="ai-tag"><Bot size={11} /> AI reviewed</span>}</div>
    <div className="listing-body"><h3 className="listing-title">{listing.title}</h3><div className="listing-price">{formatPrice(listing.price)}</div><div className="listing-meta"><MapPin size={12} /><span>{listing.location}</span><span className="meta-sep">·</span><span>{listing.time}</span></div><div className="seller-row"><img className="seller-avatar" src={listing.sellerAvatar} alt="" /><span>Listed by {listing.seller}</span><BadgeCheck size={13} color="#0c8b78" /></div></div>
  </article>;
}

function MarketplaceHeader({ savedCount, user, onChat, onLogin, onAccount, onPost, onLocation, locationName }: { savedCount: number; user: UserProfile | null; onChat: () => void; onLogin: () => void; onAccount: () => void; onPost: () => void; onLocation: () => void; locationName: string }) {
  return <header className="topbar"><div className="shell nav-inner"><Brand /><nav className="nav-links"><a href="#browse">Browse</a><a href="#categories">Categories</a><a href="/saved">Saved{savedCount > 0 ? ` (${savedCount})` : ""}</a><a href="#how-it-works">How it works</a></nav><div className="nav-actions"><button className="location-pill compact" onClick={onLocation}><MapPin size={14} />{locationName}<ChevronRight size={13} /></button><button className="icon-button" aria-label="Open chats" onClick={onChat}><MessageCircle size={17} /></button>{user ? <button className="account-button" onClick={onAccount}><UserRound size={16} />{user.name || "Account"}</button> : <button className="outline-button login-button" onClick={onLogin}><LogIn size={15} />Log in</button>}<button className="primary-button" onClick={onPost}><Plus size={16} />Sell something</button></div></div></header>;
}

function ChatPanel({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: "welcome", from: "seller", text: `Hi! Thanks for your interest in the ${listing.title.toLowerCase()}. It is still available.`, time: "Just now" }]);
  const sendMessage = (event: FormEvent) => { event.preventDefault(); const text = draft.trim(); if (!text) return; setMessages((current) => [...current, { id: `${Date.now()}`, from: "you", text, time: "Just now" }]); setDraft(""); window.setTimeout(() => setMessages((current) => [...current, { id: `${Date.now()}-reply`, from: "seller", text: "Thanks for the message! I will get back to you shortly.", time: "Just now" }]), 650); };
  return <div className="modal-backdrop" role="presentation" onClick={onClose}><div className="modal chat-modal" role="dialog" aria-modal="true" aria-label={`Chat with ${listing.seller}`} onClick={(event) => event.stopPropagation()}><div className="chat-header"><div className="chat-person"><img src={listing.sellerAvatar} alt="" /><div><strong>{listing.seller}</strong><span><span className="online-dot" />Usually replies quickly</span></div></div><button className="close-button" onClick={onClose} aria-label="Close chat"><X size={17} /></button></div><div className="chat-listing"><img src={listing.image} alt="" /><div><strong>{listing.title}</strong><span>{formatPrice(listing.price)} · {listing.location}</span></div></div><div className="chat-thread">{messages.map((message) => <div key={message.id} className={`chat-row ${message.from === "you" ? "mine" : ""}`}><div className="chat-bubble">{message.text}<small>{message.time}</small></div></div>)}</div><form className="chat-compose" onSubmit={sendMessage}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a message..." aria-label="Write a message" /><button className="primary-button" type="submit" aria-label="Send message"><MessageCircle size={17} /></button></form></div></div>;
}

function AuthModal({ onClose, onLogin }: { onClose: () => void; onLogin: (user: UserProfile) => void }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [isSending, setIsSending] = useState(false);
  const submitPhone = (event: FormEvent) => { event.preventDefault(); if (phone.replace(/\D/g, "").length < 10) { toast.error("Enter a valid 10-digit mobile number."); return; } setIsSending(true); window.setTimeout(() => { setIsSending(false); setStep("otp"); toast.success("Demo OTP sent. Use 123456 to continue."); }, 650); };
  const submitOtp = (event: FormEvent) => { event.preventDefault(); if (otp !== "123456") { toast.error("For this demo, use OTP 123456."); return; } const user = { phone: `+91 ${phone.replace(/\D/g, "").slice(-10)}`, name: "Neighbor" }; onLogin(user); toast.success("You are signed in to Looplist."); onClose(); };
  return <div className="modal-backdrop" role="presentation" onClick={onClose}><div className="modal auth-modal" role="dialog" aria-modal="true" aria-label="Log in to Looplist" onClick={(event) => event.stopPropagation()}><div className="modal-header"><div><p className="section-kicker">Your local shelf</p><h2 className="modal-title">{step === "phone" ? "Log in with your phone" : "Enter your OTP"}</h2><p className="modal-copy">{step === "phone" ? "Keep chats, saved finds, and listings together." : `We sent a 6-digit code to +91 ${phone.replace(/\D/g, "").slice(-10)}.`}</p></div><button className="close-button" onClick={onClose} aria-label="Close"><X size={17} /></button></div><form className="auth-form" onSubmit={step === "phone" ? submitPhone : submitOtp}>{step === "phone" ? <><label htmlFor="login-phone">Mobile number</label><div className="phone-input"><span>+91</span><input id="login-phone" value={phone} onChange={(event) => setPhone(event.target.value)} inputMode="numeric" placeholder="98765 43210" autoFocus /></div><button className="primary-button" type="submit" disabled={isSending}>{isSending ? <><Loader2 size={16} className="spin" />Sending code…</> : <><Phone size={16} />Send OTP</>}</button><small>Demo login only. No SMS is sent from this preview.</small></> : <><label htmlFor="login-otp">6-digit OTP</label><input className="otp-input" id="login-otp" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" placeholder="123456" autoFocus /><button className="primary-button" type="submit"><CheckCircle2 size={16} />Verify and continue</button><button type="button" className="text-button" onClick={() => setStep("phone")}>Change mobile number</button></>}</form></div></div>;
}

function LocationModal({ current, onClose, onSelect }: { current: string; onClose: () => void; onSelect: (location: string) => void }) {
  const [custom, setCustom] = useState("");
  const choices = ["Westside", "Riverside", "North Park", "Old Town", "Meadowview"];
  return <div className="modal-backdrop" role="presentation" onClick={onClose}><div className="modal location-modal" role="dialog" aria-modal="true" aria-label="Set your location" onClick={(event) => event.stopPropagation()}><div className="modal-header"><div><p className="section-kicker">Nearby discovery</p><h2 className="modal-title">Set your location</h2><p className="modal-copy">We’ll show closer finds and make recommendations more useful.</p></div><button className="close-button" onClick={onClose} aria-label="Close"><X size={17} /></button></div><div className="location-content"><div className="location-current"><MapPin size={17} /><div><span>Currently browsing near</span><strong>{current}</strong></div></div><div className="location-options">{choices.map((choice) => <button key={choice} className={current === choice ? "selected" : ""} onClick={() => { onSelect(choice); onClose(); }}>{choice}<ChevronRight size={15} /></button>)}</div><div className="location-custom"><label htmlFor="custom-location">Or enter a neighborhood / PIN code</label><div><input id="custom-location" value={custom} onChange={(event) => setCustom(event.target.value)} placeholder="e.g. 560001 or Indiranagar" /><button className="primary-button" onClick={() => { if (custom.trim()) { onSelect(custom.trim()); onClose(); } }}>Set</button></div></div></div></div></div>;
}

function CustomerPanel({ user, savedCount, listingCount, onClose, onPost, onLogin }: { user: UserProfile | null; savedCount: number; listingCount: number; onClose: () => void; onPost: () => void; onLogin: () => void }) {
  if (!user) return <AuthModal onClose={onClose} onLogin={() => { onLogin(); onClose(); }} />;
  return <div className="modal-backdrop" role="presentation" onClick={onClose}><div className="modal customer-panel" role="dialog" aria-modal="true" aria-label="Customer panel" onClick={(event) => event.stopPropagation()}><div className="modal-header"><div><p className="section-kicker">Your Looplist</p><h2 className="modal-title">Customer panel</h2><p className="modal-copy">Keep your local buying and selling in one place.</p></div><button className="close-button" onClick={onClose} aria-label="Close"><X size={17} /></button></div><div className="profile-card"><span className="profile-avatar"><UserRound size={20} /></span><div><strong>{user.name}</strong><span>{user.phone}</span></div><BadgeCheck size={17} color="#0c8b78" /></div><div className="panel-stats"><div><strong>{savedCount}</strong><span>Saved</span></div><div><strong>{listingCount}</strong><span>My listings</span></div><div><strong>0</strong><span>Chats</span></div></div><div className="panel-actions"><button onClick={() => { onClose(); window.location.href = "/saved"; }}><Heart size={17} />Saved finds<ChevronRight size={15} /></button><button onClick={() => { onClose(); onPost(); }}><Plus size={17} />Post a new listing<ChevronRight size={15} /></button><button onClick={() => toast("Profile settings are coming next.")}><Settings size={17} />Profile settings<ChevronRight size={15} /></button></div><button className="panel-signout" onClick={() => { localStorage.removeItem(USER_KEY); toast("You have been signed out."); onClose(); }}>Sign out</button></div></div>;
}

function PostListingModal({ onClose, onPosted }: { onClose: () => void; onPosted: (listing: Listing) => void }) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<Exclude<Category, "All">>("Home");
  const [location, setLocation] = useState("Westside");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [aiReview, setAiReview] = useState<AiReview | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const handleMedia = (event: ChangeEvent<HTMLInputElement>) => { const files = Array.from(event.target.files || []).slice(0, 4); if (!files.length) return; setMedia(files.map((file) => ({ type: file.type.startsWith("video/") ? "video" : "image", src: URL.createObjectURL(file) }))); setAiReview(null); };
  const analyzeVideo = () => { const video = media.find((item) => item.type === "video"); if (!video) { toast.error("Add at least one product video first."); return; } setIsAnalyzing(true); window.setTimeout(() => { const isPhone = /phone|iphone|mobile|pixel|samsung/i.test(`${title} ${description}`); setAiReview({ summary: isPhone ? "Screen, frame, and camera area reviewed. One buyer follow-up is recommended." : "The videos have enough coverage for a first-pass condition review.", confidence: isPhone ? "82%" : "78%", notes: isPhone ? ["No obvious cracks or dead pixels are visible in the sample frames.", "Display replacement cannot be confirmed from video alone — show True Tone and Settings > General > About before meeting.", "Add a close-up of the ports and battery health for a stronger review."] : ["No obvious major damage is visible in the sample frames.", "Lighting and focus look usable for a buyer’s first review.", "Buyers should still inspect the item in person before paying."] }); setIsAnalyzing(false); toast.success("AI review complete — check the notes before publishing."); }, 1500); };
  const submit = (event: FormEvent) => { event.preventDefault(); if (!title.trim() || !price.trim()) { toast.error("Add a title and price to publish your listing."); return; } const gallery = media.length ? media : [{ type: "image" as const, src: image("photo-1523275335684-37898b6baf30") }]; onPosted({ id: Date.now(), title, price: Number(price), location: `${location} · just now`, category, seller: "You", sellerAvatar: image("photo-1494790108377-be9c29b29330", 120), image: gallery[0].src, media: gallery, time: "Just now", aiReviewed: Boolean(aiReview), aiReviewSummary: aiReview?.summary, aiNotes: aiReview?.notes, description: description || "A lovely local find, ready for a new home." }); toast.success("Your listing is live — nice one!"); onClose(); };
  return <div className="modal-backdrop" role="presentation" onClick={onClose}><div className="modal post-modal" role="dialog" aria-modal="true" aria-label="Post a listing" onClick={(event) => event.stopPropagation()}><div className="modal-header"><div><p className="section-kicker">Sell something good</p><h2 className="modal-title">Post a listing</h2><p className="modal-copy">Add up to 4 photos or videos so buyers can see the real thing.</p></div><button className="close-button" onClick={onClose} aria-label="Close"><X size={17} /></button></div><form className="form-grid" onSubmit={submit}><div className="form-field full"><label htmlFor="listing-title">What are you selling?</label><input id="listing-title" autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. iPhone 13 in midnight" /></div><div className="form-field"><label htmlFor="listing-price">Price (₹)</label><input id="listing-price" type="number" min="0" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="e.g. 18,000" /></div><div className="form-field"><label htmlFor="listing-category">Category</label><select id="listing-category" value={category} onChange={(event) => setCategory(event.target.value as Exclude<Category, "All">)}>{categories.map((item) => <option key={item.name}>{item.name}</option>)}</select></div><div className="form-field"><label htmlFor="listing-location">Location</label><select id="listing-location" value={location} onChange={(event) => setLocation(event.target.value)}><option>Westside</option><option>Riverside</option><option>North Park</option><option>Old Town</option><option>Meadowview</option></select></div><div className="form-field"><label htmlFor="listing-media">Photos or videos (up to 4)</label><input id="listing-media" type="file" accept="image/*,video/*" capture="environment" multiple onChange={handleMedia} />{media.length > 0 && <small style={{ color: "var(--teal-dark)" }}>{media.length} media item{media.length > 1 ? "s" : ""} ready.</small>}</div>{media.length > 0 && <div className="form-field full"><div className="media-strip">{media.map((item, index) => <div className="media-thumb" key={item.src}>{item.type === "video" ? <video src={item.src} muted /> : <img src={item.src} alt={`Upload ${index + 1}`} />}<span>{item.type === "video" ? <Video size={12} /> : <Camera size={12} />}{index + 1}</span></div>)}</div></div>}<div className="form-field full"><div className="ai-review-card"><div className="ai-review-heading"><span className="ai-icon"><Bot size={17} /></span><div><strong>AI-assisted condition review</strong><span>Upload 1–4 product videos and get visible-condition notes before publishing.</span></div><span className="ai-beta">BETA</span></div><div className="ai-capture-row"><button type="button" className="outline-button ai-check-button" onClick={analyzeVideo} disabled={isAnalyzing || !media.some((item) => item.type === "video")}>{isAnalyzing ? <><Loader2 size={15} className="spin" />Reviewing…</> : <><Bot size={15} />Run AI check</>}</button><span className="ai-tip"><Video size={14} /> Show front, sides, screen, ports, and serial area</span></div>{aiReview && <div className="ai-result"><div className="ai-result-top"><CheckCircle2 size={17} /><strong>AI review ready · {aiReview.confidence} confidence</strong></div><p>{aiReview.summary}</p><ul>{aiReview.notes.map((note) => <li key={note}><AlertTriangle size={13} />{note}</li>)}</ul><small>AI-assisted review is not a guarantee. Buyers should inspect the item and verify details before paying.</small></div>}</div></div><div className="form-field full"><label htmlFor="listing-description">Description</label><textarea id="listing-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Share the useful details — condition, dimensions, what you love about it..." /></div><div className="form-actions"><button type="button" className="outline-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button"><Plus size={16} />{aiReview ? "Publish AI-reviewed listing" : "Publish listing"}</button></div></form></div></div>;
}

function ListingPage({ listing, allListings, saved, onSave, onChat, onBack, onOpen, headerProps }: { listing: Listing; allListings: Listing[]; saved: boolean; onSave: () => void; onChat: () => void; onBack: () => void; onOpen: (listing: Listing) => void; headerProps: { savedCount: number; user: UserProfile | null; onChat: () => void; onLogin: () => void; onAccount: () => void; onPost: () => void; onLocation: () => void; locationName: string } }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const media = getMedia(listing);
  const nearby = allListings.filter((item) => item.id !== listing.id && (item.category === listing.category || item.location.split("·")[0].trim() === listing.location.split("·")[0].trim())).slice(0, 4);
  const activeMedia = media[activeIndex];
  const move = (direction: number) => setActiveIndex((current) => (current + direction + media.length) % media.length);
  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => setTouchStart(event.touches[0]?.clientX ?? null);
  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => { if (touchStart === null) return; const distance = (event.changedTouches[0]?.clientX ?? touchStart) - touchStart; if (Math.abs(distance) > 40) move(distance < 0 ? 1 : -1); setTouchStart(null); };
  return <div id="top"><MarketplaceHeader {...headerProps} /><main className="detail-page"><div className="shell"><button className="back-link" onClick={onBack}><ArrowLeft size={16} />Back to nearby finds</button><div className="detail-page-grid"><section><div className="gallery-viewer" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>{activeMedia.type === "video" ? <video src={activeMedia.src} controls playsInline /> : <img src={activeMedia.src} alt={listing.title} />}{media.length > 1 && <><button className="gallery-arrow left" onClick={() => move(-1)} aria-label="Previous media"><ChevronLeft size={20} /></button><button className="gallery-arrow right" onClick={() => move(1)} aria-label="Next media"><ChevronRight size={20} /></button><div className="gallery-count">{activeIndex + 1} / {media.length}</div></>}</div>{media.length > 1 && <div className="gallery-thumbs">{media.map((item, index) => <button key={item.src} className={index === activeIndex ? "active" : ""} onClick={() => setActiveIndex(index)}>{item.type === "video" ? <video src={item.src} muted /> : <img src={item.src} alt="" />}{item.type === "video" && <Video size={13} />}</button>)}</div>}</section><section className="detail-page-info"><div className="listing-meta"><MapPin size={13} /><span>{listing.location}</span><span className="meta-sep">·</span><span>{listing.time}</span></div><h1>{listing.title}</h1><div className="detail-page-price">{formatPrice(listing.price)}</div>{listing.aiReviewed && <div className="ai-review-inline"><Bot size={16} /><div><strong>AI-reviewed listing</strong><span>{listing.aiReviewSummary || "Video reviewed before publishing"}</span></div></div>}<p className="detail-description">{listing.description}</p><div className="detail-seller"><img src={listing.sellerAvatar} alt="" /><div><strong>{listing.seller}</strong><span>Verified Looplist member · Usually replies quickly</span></div><BadgeCheck size={17} color="#0c8b78" /></div><div className="detail-page-actions"><button className="primary-button" onClick={onChat}><MessageCircle size={16} />Chat with seller</button><button className="outline-button" onClick={onSave}><Heart size={16} fill={saved ? "currentColor" : "none"} />{saved ? "Saved" : "Save"}</button></div><div className="buyer-note"><ShieldCheck size={16} /><span>Meet in a public place, inspect the item, and verify details before paying.</span></div></section></div><section className="recommendations"><div className="section-head"><div><p className="section-kicker">More good things nearby</p><h2 className="section-title">Similar products you may like</h2></div><button className="section-link" onClick={onBack}>Browse all <ArrowRight size={15} /></button></div>{nearby.length > 0 ? <div className="listing-grid">{nearby.map((item) => <ListingCard key={item.id} listing={item} saved={false} onSave={() => toast("Log in to save this find")} onOpen={() => onOpen(item)} />)}</div> : <div className="empty-state">No similar finds in this neighborhood yet.</div>}</section></div></main></div>;
}

export default function Home() {
  const [path, setPath] = useLocation();
  const [isListingRoute, routeParams] = useRoute("/listing/:id");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [locationFilter, setLocationFilter] = useState("Everywhere");
  const [selectedLocation, setSelectedLocation] = useState("Westside");
  const [sort, setSort] = useState("Recommended");
  const [savedIds, setSavedIds] = useState<number[]>(() => { try { return JSON.parse(localStorage.getItem(SAVED_KEY) || "[]") as number[]; } catch { return []; } });
  const [user, setUser] = useState<UserProfile | null>(() => { try { return JSON.parse(localStorage.getItem(USER_KEY) || "null") as UserProfile | null; } catch { return null; } });
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showPost, setShowPost] = useState(false);
  const [showChat, setShowChat] = useState<Listing | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [postedListings, setPostedListings] = useState<Listing[]>([]);

  useEffect(() => { localStorage.setItem(SAVED_KEY, JSON.stringify(savedIds)); }, [savedIds]);
  useEffect(() => { if (user) localStorage.setItem(USER_KEY, JSON.stringify(user)); else localStorage.removeItem(USER_KEY); }, [user]);

  const allListings = [...postedListings, ...listings];
  const filteredListings = useMemo(() => { let result = allListings.filter((item) => { const searchMatch = `${item.title} ${item.category} ${item.location}`.toLowerCase().includes(query.toLowerCase()); const categoryMatch = activeCategory === "All" || item.category === activeCategory; const locationMatch = locationFilter === "Everywhere" || item.location.toLowerCase().includes(locationFilter.toLowerCase()); return searchMatch && categoryMatch && locationMatch; }); if (sort === "Price: low to high") result = [...result].sort((a, b) => a.price - b.price); if (sort === "Newest first") result = [...result].sort((a, b) => b.id - a.id); return result; }, [activeCategory, allListings, locationFilter, query, sort]);
  const isSavedPage = path === "/saved";
  const visibleListings = isSavedPage ? filteredListings.filter((item) => savedIds.includes(item.id)) : filteredListings;
  const featuredListings = visibleListings.filter((item) => item.featured);
  const recentListings = visibleListings.filter((item) => !item.featured);
  const routeListing = isListingRoute && routeParams?.id ? allListings.find((item) => String(item.id) === routeParams.id) : null;
  const toggleSaved = (id: number) => setSavedIds((current) => current.includes(id) ? current.filter((savedId) => savedId !== id) : [...current, id]);
  const openDetail = (listing: Listing) => { setSelectedListing(listing); setPath(`/listing/${listing.id}`); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const headerProps = { savedCount: savedIds.length, user, onChat: () => setShowChat(allListings[0]), onLogin: () => setShowLogin(true), onAccount: () => setShowAccount(true), onPost: () => setShowPost(true), onLocation: () => setShowLocation(true), locationName: selectedLocation };
  const closeDetail = () => { setSelectedListing(null); setPath(isSavedPage ? "/saved" : "/"); };
  const scrollToBrowse = () => document.getElementById("browse")?.scrollIntoView({ behavior: "smooth" });

  if (isListingRoute && !routeListing) return <div className="empty-state" style={{ maxWidth: 520, margin: "120px auto" }}><strong>This listing has moved on.</strong>Try another local find from the home page.</div>;
  if (isListingRoute && routeListing) return <ListingPage listing={routeListing} allListings={allListings} saved={savedIds.includes(routeListing.id)} onSave={() => toggleSaved(routeListing.id)} onChat={() => setShowChat(routeListing)} onBack={closeDetail} onOpen={openDetail} headerProps={headerProps} />;

  return <div id="top"><MarketplaceHeader {...headerProps} /><main><section className="hero"><div className="shell hero-grid"><div><div className="eyebrow"><span className="eyebrow-dot" />Good things, nearby</div><h1>Find your next good thing.</h1><p className="hero-copy">A friendlier way to buy and sell locally. Browse thoughtful finds, meet good neighbors, and keep great stuff in the loop.</p><form className="search-card" onSubmit={(event) => { event.preventDefault(); scrollToBrowse(); }}><Search size={19} className="search-icon" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search for furniture, bikes, phones..." aria-label="Search listings" /><button className="search-submit" type="submit">Search</button></form><button className="location-pill" onClick={() => setShowLocation(true)}><MapPin size={15} />Showing finds near <strong>{selectedLocation}</strong><ChevronDown size={14} /></button></div><div className="hero-art"><div className="art-main"><img src={image("photo-1524758631624-e2822e304c36", 900)} alt="A bright, welcoming workspace" /></div><div className="art-note">Small finds.<br />Big yes.</div><div className="art-badge"><span className="avatar-stack"><span style={{ backgroundImage: `url(${image("photo-1494790108377-be9c29b29330", 120)})` }} /><span style={{ backgroundImage: `url(${image("photo-1500648767791-00dcc994a43e", 120)})` }} /><span style={{ backgroundImage: `url(${image("photo-1507003211169-0a1dd7228f2d", 120)})` }} /></span><span>Trusted by local neighbors</span></div></div></div></section><section className="section" id="categories"><div className="shell"><div className="section-head"><div><p className="section-kicker">Start somewhere</p><h2 className="section-title">What are you looking for?</h2></div><button className="section-link" onClick={() => setActiveCategory("All")}>View all <ArrowRight size={15} /></button></div><div className="category-scroller">{categories.map((category) => { const Icon = category.icon; return <button key={category.name} className={`category-card ${activeCategory === category.name ? "active" : ""}`} onClick={() => { setActiveCategory(category.name); scrollToBrowse(); }}><span className="category-icon"><Icon size={19} /></span><strong>{category.name}</strong><small>{category.count} listings</small></button>; })}</div></div></section><section className="section" id="browse" style={{ paddingTop: 7 }}><div className="shell"><div className="section-head"><div><p className="section-kicker">{isSavedPage ? "Your shortlist" : "The neighborhood shelf"}</p><h2 className="section-title">{isSavedPage ? "Saved for later" : "Fresh around you"}</h2></div><button className="section-link" onClick={() => { setActiveCategory("All"); setQuery(""); setLocationFilter("Everywhere"); }}>Clear filters <X size={14} /></button></div><div className="filters-row"><select className="filter-select" value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)} aria-label="Filter by location"><option>Everywhere</option><option>Westside</option><option>Riverside</option><option>North Park</option><option>Old Town</option><option>Meadowview</option></select><select className="filter-select" value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort listings"><option>Recommended</option><option>Newest first</option><option>Price: low to high</option></select>{activeCategory !== "All" && <button className="filter-select" onClick={() => setActiveCategory("All")}>{activeCategory} <X size={12} style={{ verticalAlign: "-2px" }} /></button>}<span className="results-count">{visibleListings.length} {visibleListings.length === 1 ? "listing" : "listings"}</span></div>{visibleListings.length > 0 ? <>{!isSavedPage && featuredListings.length > 0 && <><div className="section-head" style={{ marginTop: 32, marginBottom: 16 }}><div><p className="section-kicker">Picked with care</p><h2 className="section-title" style={{ fontSize: 22 }}>Featured finds</h2></div></div><div className="listing-grid">{featuredListings.map((listing) => <ListingCard key={listing.id} listing={listing} saved={savedIds.includes(listing.id)} onSave={() => toggleSaved(listing.id)} onOpen={() => openDetail(listing)} />)}</div></>}{recentListings.length > 0 && <><div className="section-head" style={{ marginTop: 37, marginBottom: 16 }}><div><p className="section-kicker">Just added</p><h2 className="section-title" style={{ fontSize: 22 }}>{isSavedPage ? "Saved finds" : "Recently listed"}</h2></div></div><div className="listing-grid">{recentListings.map((listing) => <ListingCard key={listing.id} listing={listing} saved={savedIds.includes(listing.id)} onSave={() => toggleSaved(listing.id)} onOpen={() => openDetail(listing)} />)}</div></>}</> : <div className="empty-state"><strong>{isSavedPage ? "Nothing saved yet." : "No exact matches yet."}</strong>{isSavedPage ? "Tap the heart on a listing and it will stay here for later." : "Try another search or clear the filters to see more local finds."}</div>}</div></section><section className="trust-band" id="how-it-works"><div className="shell trust-grid"><div className="trust-item"><span className="trust-icon"><ShieldCheck size={17} /></span><div><strong>Keep it human</strong><p>Real people, real listings, no noisy bidding wars.</p></div></div><div className="trust-item"><span className="trust-icon"><MapPin size={17} /></span><div><strong>Close to home</strong><p>Discover useful things within a few friendly miles.</p></div></div><div className="trust-item"><span className="trust-icon"><Package size={17} /></span><div><strong>Give it another life</strong><p>Pass good things on, and keep them in the loop.</p></div></div></div></section></main><footer className="footer"><div className="shell footer-inner"><div>© 2026 Looplist · Made for good neighbors</div><div className="footer-links"><a href="#top">About</a><a href="#how-it-works">Safety</a><a href="#how-it-works">Community</a></div></div></footer>{showChat && <ChatPanel listing={showChat} onClose={() => setShowChat(null)} />}{showLogin && <AuthModal onClose={() => setShowLogin(false)} onLogin={(nextUser) => setUser(nextUser)} />}{showAccount && <CustomerPanel user={user} savedCount={savedIds.length} listingCount={postedListings.length} onClose={() => setShowAccount(false)} onPost={() => setShowPost(true)} onLogin={() => setShowLogin(true)} />}{showLocation && <LocationModal current={selectedLocation} onClose={() => setShowLocation(false)} onSelect={(nextLocation) => { setSelectedLocation(nextLocation); setLocationFilter(nextLocation); toast.success(`Showing finds near ${nextLocation}`); }} />}{showPost && <PostListingModal onClose={() => setShowPost(false)} onPosted={(listing) => setPostedListings((current) => [listing, ...current])} />}</div>;
}
