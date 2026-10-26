import {
  ArrowRight,
  AlertTriangle,
  BadgeCheck,
  Bell,
  Bike,
  Bot,
  BookOpen,
  BriefcaseBusiness,
  Camera,
  CircleHelp,
  Heart,
  MapPin,
  MessageCircle,
  Package,
  Plus,
  Search,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Sofa,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useLocation, useRoute } from "wouter";
import { toast } from "sonner";

type Category = "All" | "Home" | "Electronics" | "Vehicles" | "Fashion" | "Hobbies" | "Services";
  type Listing = {
  id: number;
  title: string;
  price: number;
  location: string;
  category: Exclude<Category, "All">;
  seller: string;
  sellerAvatar: string;
  image: string;
  time: string;
  featured?: boolean;
  aiReviewed?: boolean;
  aiReviewSummary?: string;
  aiNotes?: string[];
  description: string;
};

const SAVED_KEY = "looplist-saved-ids";
const image = (id: string, width = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
const formatPrice = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

type ChatMessage = { id: string; from: "seller" | "you"; text: string; time: string };
type AiReview = { summary: string; notes: string[]; confidence: string };

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

function Brand() {
  return <a className="brand" href="/" aria-label="Looplist home"><span className="brand-mark"><Sparkles size={17} strokeWidth={2.6} /></span><span>looplist</span></a>;
}

function ListingCard({ listing, saved, onSave, onOpen }: { listing: Listing; saved: boolean; onSave: () => void; onOpen: () => void }) {
  return (
    <article className="listing-card" onClick={onOpen}>
      <div className="listing-image-wrap">
        <img src={listing.image} alt={listing.title} loading="lazy" />
        <button className={`save-button ${saved ? "saved" : ""}`} aria-label={saved ? "Remove from saved" : "Save listing"} onClick={(event) => { event.stopPropagation(); onSave(); }}>
          <Heart size={17} fill={saved ? "currentColor" : "none"} />
        </button>
        {listing.featured && <span className="featured-tag">Featured</span>}
        {listing.aiReviewed && <span className="ai-tag"><Bot size={11} /> AI reviewed</span>}
      </div>
      <div className="listing-body">
        <h3 className="listing-title">{listing.title}</h3>
        <div className="listing-price">{formatPrice(listing.price)}</div>
        <div className="listing-meta"><MapPin size={12} /><span>{listing.location}</span><span className="meta-sep">·</span><span>{listing.time}</span></div>
        <div className="seller-row"><img className="seller-avatar" src={listing.sellerAvatar} alt="" /><span>Listed by {listing.seller}</span><BadgeCheck size={13} color="#0c8b78" /></div>
      </div>
    </article>
  );
}

function ListingDetail({ listing, saved, onSave, onChat, onClose }: { listing: Listing; saved: boolean; onSave: () => void; onChat: () => void; onClose: () => void }) {
  return <div className="modal-backdrop" role="presentation" onClick={onClose}>
    <div className="modal detail" role="dialog" aria-modal="true" aria-label={listing.title} onClick={(event) => event.stopPropagation()}>
      <div className="modal-header"><div><p className="section-kicker">{listing.category} · {listing.time}</p><h2 className="modal-title">A good find, right here.</h2></div><button className="close-button" onClick={onClose} aria-label="Close"><X size={17} /></button></div>
      <div className="detail-content">
        <div className="detail-image"><img src={listing.image} alt={listing.title} /></div>
        <div className="detail-info"><h3 className="listing-title" style={{ fontSize: 21 }}>{listing.title}</h3><div className="listing-price">{formatPrice(listing.price)}</div><div className="listing-meta"><MapPin size={13} /><span>{listing.location}</span></div>{listing.aiReviewed && <div className="ai-review-inline"><Bot size={16} /><div><strong>AI-assisted condition review</strong><span>{listing.aiReviewSummary || "Video reviewed before publishing"}</span></div></div>}<p className="detail-description">{listing.description}</p>
          <div className="detail-seller"><img src={listing.sellerAvatar} alt="" /><div><strong>{listing.seller}</strong><span>Verified Looplist member · Usually replies quickly</span></div></div>
          <div style={{ display: "flex", gap: 9 }}><button className="primary-button" style={{ flex: 1 }} onClick={onChat}><MessageCircle size={16} />Chat with seller</button><button className="outline-button" onClick={onSave}><Heart size={16} fill={saved ? "currentColor" : "none"} />{saved ? "Saved" : "Save"}</button></div>
        </div>
      </div>
    </div>
  </div>;
}

function ChatPanel({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", from: "seller", text: `Hi! Thanks for your interest in the ${listing.title.toLowerCase()}. It is still available.`, time: "Just now" },
  ]);
  const sendMessage = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages((current) => [...current, { id: `${Date.now()}`, from: "you", text, time: "Just now" }]);
    setDraft("");
    window.setTimeout(() => setMessages((current) => [...current, { id: `${Date.now()}-reply`, from: "seller", text: "Thanks for the message! I will get back to you shortly.", time: "Just now" }]), 650);
  };
  return <div className="modal-backdrop" role="presentation" onClick={onClose}><div className="modal chat-modal" role="dialog" aria-modal="true" aria-label={`Chat with ${listing.seller}`} onClick={(event) => event.stopPropagation()}><div className="chat-header"><div className="chat-person"><img src={listing.sellerAvatar} alt="" /><div><strong>{listing.seller}</strong><span><span className="online-dot" />Usually replies quickly</span></div></div><button className="close-button" onClick={onClose} aria-label="Close chat"><X size={17} /></button></div><div className="chat-listing"><img src={listing.image} alt="" /><div><strong>{listing.title}</strong><span>{formatPrice(listing.price)} · {listing.location}</span></div></div><div className="chat-thread">{messages.map((message) => <div key={message.id} className={`chat-row ${message.from === "you" ? "mine" : ""}`}><div className="chat-bubble">{message.text}<small>{message.time}</small></div></div>)}</div><form className="chat-compose" onSubmit={sendMessage}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a message..." aria-label="Write a message" /><button className="primary-button" type="submit" aria-label="Send message"><MessageCircle size={17} /></button></form></div></div>;
}

function PostListingModal({ onClose, onPosted }: { onClose: () => void; onPosted: (listing: Listing) => void }) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<Exclude<Category, "All">>("Home");
  const [location, setLocation] = useState("Westside");
  const [description, setDescription] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [aiReview, setAiReview] = useState<AiReview | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setPhotoUrl(URL.createObjectURL(file));
  };
  const handleVideo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setVideoUrl(URL.createObjectURL(file));
    setAiReview(null);
  };
  const analyzeVideo = () => {
    if (!videoUrl) { toast.error("Add a short product video first."); return; }
    setIsAnalyzing(true);
    window.setTimeout(() => {
      const isPhone = /phone|iphone|mobile|pixel|samsung/i.test(`${title} ${description}`);
      setAiReview({
        summary: isPhone ? "Screen, frame, and camera area reviewed. One buyer follow-up is recommended." : "The video has enough coverage for a first-pass condition review.",
        confidence: isPhone ? "82%" : "78%",
        notes: isPhone
          ? ["No obvious cracks or dead pixels are visible in the sample frames.", "Display replacement cannot be confirmed from video alone — show True Tone and Settings > General > About before meeting.", "Add a close-up of the ports and battery health for a stronger review."]
          : ["No obvious major damage is visible in the sample frames.", "Lighting and focus look usable for a buyer’s first review.", "Buyers should still inspect the item in person before paying."],
      });
      setIsAnalyzing(false);
      toast.success("AI review complete — check the notes before publishing.");
    }, 1500);
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !price.trim()) { toast.error("Add a title and price to publish your listing."); return; }
    onPosted({ id: Date.now(), title, price: Number(price), location: `${location} · just now`, category, seller: "You", sellerAvatar: image("photo-1494790108377-be9c29b29330", 120), image: photoUrl || image("photo-1523275335684-37898b6baf30"), time: "Just now", aiReviewed: Boolean(aiReview), aiReviewSummary: aiReview?.summary, aiNotes: aiReview?.notes, description: description || "A lovely local find, ready for a new home." });
    toast.success("Your listing is live — nice one!");
    onClose();
  };
  return <div className="modal-backdrop" role="presentation" onClick={onClose}><div className="modal" role="dialog" aria-modal="true" aria-label="Post a listing" onClick={(event) => event.stopPropagation()}><div className="modal-header"><div><p className="section-kicker">Sell something good</p><h2 className="modal-title">Post a listing</h2><p className="modal-copy">A few details helps the right person find it.</p></div><button className="close-button" onClick={onClose} aria-label="Close"><X size={17} /></button></div><form className="form-grid" onSubmit={submit}><div className="form-field full"><label htmlFor="listing-title">What are you selling?</label><input id="listing-title" autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Solid oak coffee table" /></div><div className="form-field"><label htmlFor="listing-price">Price (₹)</label><input id="listing-price" type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 18,000" /></div><div className="form-field"><label htmlFor="listing-category">Category</label><select id="listing-category" value={category} onChange={(e) => setCategory(e.target.value as Exclude<Category, "All">)}>{categories.map((item) => <option key={item.name}>{item.name}</option>)}</select></div><div className="form-field"><label htmlFor="listing-location">Location</label><select id="listing-location" value={location} onChange={(e) => setLocation(e.target.value)}><option>Westside</option><option>Riverside</option><option>North Park</option><option>Old Town</option><option>Meadowview</option></select></div><div className="form-field"><label htmlFor="listing-photo">Photo</label><input id="listing-photo" type="file" accept="image/*" onChange={handlePhoto} />{photoUrl && <small style={{ color: "var(--teal-dark)" }}>Photo ready to publish.</small>}</div><div className="form-field full"><div className="ai-review-card"><div className="ai-review-heading"><span className="ai-icon"><Bot size={17} /></span><div><strong>AI-assisted condition review</strong><span>Upload a short video and get seller-friendly capture tips plus visible-condition notes.</span></div><span className="ai-beta">BETA</span></div><div className="ai-capture-row"><label className="video-input" htmlFor="listing-video"><input id="listing-video" type="file" accept="video/*" capture="environment" onChange={handleVideo} /><span><Plus size={15} />{videoUrl ? "Replace video" : "Add product video"}</span></label><button type="button" className="outline-button ai-check-button" onClick={analyzeVideo} disabled={isAnalyzing || !videoUrl}>{isAnalyzing ? <><Loader2 size={15} className="spin" />Reviewing…</> : <><Bot size={15} />Run AI check</>}</button></div>{videoUrl && <video className="video-preview" src={videoUrl} controls muted playsInline />}{aiReview && <div className="ai-result"><div className="ai-result-top"><CheckCircle2 size={17} /><strong>AI review ready · {aiReview.confidence} confidence</strong></div><p>{aiReview.summary}</p><ul>{aiReview.notes.map((note) => <li key={note}><AlertTriangle size={13} />{note}</li>)}</ul><small>AI-assisted review is not a guarantee. Buyers should inspect the item and verify details before paying.</small></div>}</div></div><div className="form-field full"><label htmlFor="listing-description">Description</label><textarea id="listing-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Share the useful details — condition, dimensions, what you love about it..." /></div><div className="form-actions"><button type="button" className="outline-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button"><Plus size={16} />{aiReview ? "Publish AI-reviewed listing" : "Publish listing"}</button></div></form></div></div>;
}

export default function Home() {
  const [path, setPath] = useLocation();
  const [isListingRoute, routeParams] = useRoute("/listing/:id");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [locationFilter, setLocationFilter] = useState("Everywhere");
  const [sort, setSort] = useState("Recommended");
  const [savedIds, setSavedIds] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(window.localStorage.getItem(SAVED_KEY) || "[]") as number[]; } catch { return []; }
  });
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showPost, setShowPost] = useState(false);
  const [postedListings, setPostedListings] = useState<Listing[]>([]);
  const [chatListing, setChatListing] = useState<Listing | null>(null);

  useEffect(() => {
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(savedIds));
  }, [savedIds]);

  const allListings = [...postedListings, ...listings];
  const filteredListings = useMemo(() => {
    let result = allListings.filter((item) => {
      const searchMatch = `${item.title} ${item.category} ${item.location}`.toLowerCase().includes(query.toLowerCase());
      const categoryMatch = activeCategory === "All" || item.category === activeCategory;
      const locationMatch = locationFilter === "Everywhere" || item.location.toLowerCase().includes(locationFilter.toLowerCase());
      return searchMatch && categoryMatch && locationMatch;
    });
    if (sort === "Price: low to high") result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "Newest first") result = [...result].sort((a, b) => b.id - a.id);
    return result;
  }, [activeCategory, allListings, locationFilter, query, sort]);

  const isSavedPage = path === "/saved";
  const visibleListings = isSavedPage ? filteredListings.filter((item) => savedIds.includes(item.id)) : filteredListings;
  const featuredListings = visibleListings.filter((item) => item.featured);
  const recentListings = visibleListings.filter((item) => !item.featured);
  const routeListing = isListingRoute && routeParams?.id ? allListings.find((item) => String(item.id) === routeParams.id) : null;
  const activeDetail = selectedListing ?? routeListing;
  const closeDetail = () => { setSelectedListing(null); setPath(isSavedPage ? "/saved" : "/"); };
  const openDetail = (listing: Listing) => { setSelectedListing(listing); setPath(`/listing/${listing.id}`); };
  const toggleSaved = (id: number) => setSavedIds((current) => current.includes(id) ? current.filter((savedId) => savedId !== id) : [...current, id]);
  const scrollToBrowse = () => document.getElementById("browse")?.scrollIntoView({ behavior: "smooth" });

  if (isListingRoute && !routeListing) return <div className="empty-state" style={{ maxWidth: 520, margin: "120px auto" }}><strong>This listing has moved on.</strong>Try another local find from the home page.</div>;

  return <div id="top">
    <header className="topbar"><div className="shell nav-inner"><Brand /><nav className="nav-links"><a href="#browse">Browse</a><a href="#categories">Categories</a><a href="/saved">Saved{savedIds.length > 0 ? ` (${savedIds.length})` : ""}</a><a href="#how-it-works">How it works</a></nav><div className="nav-actions"><button className="icon-button" aria-label="Open chats" onClick={() => setChatListing(allListings[0])}><MessageCircle size={17} /></button><button className="icon-button" aria-label="Notifications" onClick={() => toast("You're all caught up")}><Bell size={17} /></button><button className="icon-button" aria-label="Help" onClick={() => toast("Looplist keeps local buying simple and human.")}><CircleHelp size={17} /></button><button className="primary-button" onClick={() => setShowPost(true)}><Plus size={16} />Sell something</button></div></div></header>
    <main>
      <section className="hero"><div className="shell hero-grid"><div><div className="eyebrow"><span className="eyebrow-dot" />Good things, nearby</div><h1>Find your next good thing.</h1><p className="hero-copy">A friendlier way to buy and sell locally. Browse thoughtful finds, meet good neighbors, and keep great stuff in the loop.</p><form className="search-card" onSubmit={(event) => { event.preventDefault(); scrollToBrowse(); }}><Search size={19} className="search-icon" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search for furniture, bikes, phones..." aria-label="Search listings" /><button className="search-submit" type="submit">Search</button></form></div><div className="hero-art"><div className="art-main"><img src={image("photo-1524758631624-e2822e304c36", 900)} alt="A bright, welcoming workspace" /></div><div className="art-note">Small finds.<br />Big yes.</div><div className="art-badge"><span className="avatar-stack"><span style={{ backgroundImage: `url(${image("photo-1494790108377-be9c29b29330", 120)})` }} /><span style={{ backgroundImage: `url(${image("photo-1500648767791-00dcc994a43e", 120)})` }} /><span style={{ backgroundImage: `url(${image("photo-1507003211169-0a1dd7228f2d", 120)})` }} /></span><span>Trusted by local neighbors</span></div></div></div></section>
      <section className="section" id="categories"><div className="shell"><div className="section-head"><div><p className="section-kicker">Start somewhere</p><h2 className="section-title">What are you looking for?</h2></div><button className="section-link" onClick={() => setActiveCategory("All")}>View all <ArrowRight size={15} /></button></div><div className="category-scroller">{categories.map((category) => { const Icon = category.icon; return <button key={category.name} className={`category-card ${activeCategory === category.name ? "active" : ""}`} onClick={() => { setActiveCategory(category.name); scrollToBrowse(); }}><span className="category-icon"><Icon size={19} /></span><strong>{category.name}</strong><small>{category.count} listings</small></button>; })}</div></div></section>
      <section className="section" id="browse" style={{ paddingTop: 7 }}><div className="shell"><div className="section-head"><div><p className="section-kicker">{isSavedPage ? "Your shortlist" : "The neighborhood shelf"}</p><h2 className="section-title">{isSavedPage ? "Saved for later" : "Fresh around you"}</h2></div><button className="section-link" onClick={() => { setActiveCategory("All"); setQuery(""); setLocationFilter("Everywhere"); }}>Clear filters <X size={14} /></button></div><div className="filters-row"><select className="filter-select" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} aria-label="Filter by location"><option>Everywhere</option><option>Westside</option><option>Riverside</option><option>North Park</option><option>Old Town</option><option>Meadowview</option></select><select className="filter-select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort listings"><option>Recommended</option><option>Newest first</option><option>Price: low to high</option></select>{activeCategory !== "All" && <button className="filter-select" onClick={() => setActiveCategory("All")}>{activeCategory} <X size={12} style={{ verticalAlign: "-2px" }} /></button>}<span className="results-count">{visibleListings.length} {visibleListings.length === 1 ? "listing" : "listings"}</span></div>{visibleListings.length > 0 ? <>{!isSavedPage && featuredListings.length > 0 && <><div className="section-head" style={{ marginTop: 32, marginBottom: 16 }}><div><p className="section-kicker">Picked with care</p><h2 className="section-title" style={{ fontSize: 22 }}>Featured finds</h2></div></div><div className="listing-grid">{featuredListings.map((listing) => <ListingCard key={listing.id} listing={listing} saved={savedIds.includes(listing.id)} onSave={() => toggleSaved(listing.id)} onOpen={() => openDetail(listing)} />)}</div></>}{recentListings.length > 0 && <><div className="section-head" style={{ marginTop: 37, marginBottom: 16 }}><div><p className="section-kicker">Just added</p><h2 className="section-title" style={{ fontSize: 22 }}>{isSavedPage ? "Saved finds" : "Recently listed"}</h2></div></div><div className="listing-grid">{recentListings.map((listing) => <ListingCard key={listing.id} listing={listing} saved={savedIds.includes(listing.id)} onSave={() => toggleSaved(listing.id)} onOpen={() => openDetail(listing)} />)}</div></>}</> : <div className="empty-state"><strong>{isSavedPage ? "Nothing saved yet." : "No exact matches yet."}</strong>{isSavedPage ? "Tap the heart on a listing and it will stay here for later." : "Try another search or clear the filters to see more local finds."}</div>}</div></section>
      <section className="trust-band" id="how-it-works"><div className="shell trust-grid"><div className="trust-item"><span className="trust-icon"><ShieldCheck size={17} /></span><div><strong>Keep it human</strong><p>Real people, real listings, no noisy bidding wars.</p></div></div><div className="trust-item"><span className="trust-icon"><MapPin size={17} /></span><div><strong>Close to home</strong><p>Discover useful things within a few friendly miles.</p></div></div><div className="trust-item"><span className="trust-icon"><Package size={17} /></span><div><strong>Give it another life</strong><p>Pass good things on, and keep them in the loop.</p></div></div></div></section>
    </main>
    <footer className="footer"><div className="shell footer-inner"><div>© 2026 Looplist · Made for good neighbors</div><div className="footer-links"><a href="#top">About</a><a href="#how-it-works">Safety</a><a href="#how-it-works">Community</a></div></div></footer>
    {activeDetail && <ListingDetail listing={activeDetail} saved={savedIds.includes(activeDetail.id)} onSave={() => toggleSaved(activeDetail.id)} onChat={() => setChatListing(activeDetail)} onClose={closeDetail} />}
    {chatListing && <ChatPanel listing={chatListing} onClose={() => setChatListing(null)} />}
    {showPost && <PostListingModal onClose={() => setShowPost(false)} onPosted={(listing) => setPostedListings((current) => [listing, ...current])} />}
  </div>;
}
