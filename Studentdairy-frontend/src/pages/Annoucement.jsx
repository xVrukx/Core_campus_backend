import { useEffect, useState } from "react";
import { Plus, X, Send, Bell } from "lucide-react";
import { getUserData } from "../RouteProtect";
import { Navbar } from "../components/NavBar";

export const AnnouncementPage = () => {
  const user = getUserData();
  const isTeacher = user?.role === "teacher";

  const [announcements, setAnnouncements] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/announcement");

      if (!res.ok) {
        throw new Error("Failed to fetch announcements");
      }

      const data = await res.json();
      setAnnouncements(data.announcements ?? []);
    } catch (error) {
      console.error("Fetch announcement error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) return;

    try {
      setPosting(true);

      const res = await fetch("http://localhost:5000/announcement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to post announcement");
      }

      setTitle("");
      setContent("");
      setOpenForm(false);
      await fetchAnnouncements();
    } catch (error) {
      console.error("Announcement error:", error);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E0E0] p-4 pb-24">
      <Navbar/>
      {/* SECTION 1 */}
      <div className="bg-[#1E1E1E] rounded-2xl shadow-lg p-5 text-center mb-4">
        <h1 className="text-3xl font-bold text-[#007AFF]">CampusCore</h1>
        <p className="text-[#8E8E93] mt-2">Announcements</p>
      </div>

      {/* SECTION 2 */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-[#1E1E1E] rounded-2xl p-5 text-center text-[#8E8E93]">
            Loading announcements...
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-[#1E1E1E] rounded-2xl p-5 text-center text-[#8E8E93]">
            No announcements available.
          </div>
        ) : (
          announcements.map((item) => (
            <div
              key={item._id}
              className="bg-[#1E1E1E] rounded-2xl shadow-lg p-5 border border-[#2A2A2A]"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h2 className="text-xl font-semibold text-[#FF9500]">
                    {item.title}
                  </h2>
                  <p className="text-xs text-[#8E8E93] mt-1">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>

              </div>

              <p className="text-[#E0E0E0] leading-6">{item.content}</p>
            </div>
          ))
        )}
      </div>

      {/* FLOATING ADD BUTTON - TEACHER ONLY */}
      {isTeacher && (
        <button
          onClick={() => setOpenForm(true)}
          className="
            fixed
            bottom-5
            right-5
            z-50
            h-16
            w-16
            rounded-full
            bg-[#007AFF]
            flex
            items-center
            justify-center
            shadow-2xl
            hover:scale-105
            transition
          "
        >
          <Plus className="h-8 w-8 text-white" />
        </button>
      )}

      {/* MODAL */}
      {isTeacher && openForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#1E1E1E] p-5 shadow-2xl border border-[#2A2A2A]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#007AFF]">
                New Announcement
              </h3>
              <button
                onClick={() => setOpenForm(false)}
                className="rounded-full p-2 hover:bg-[#2A2A2A] transition"
              >
                <X className="h-5 w-5 text-[#8E8E93]" />
              </button>
            </div>

            <form onSubmit={handleAddAnnouncement} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-[#8E8E93]">
                  Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  type="text"
                  placeholder="Enter announcement title"
                  className="w-full rounded-xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-[#E0E0E0] outline-none focus:border-[#007AFF]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-[#8E8E93]">
                  Content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write announcement content"
                  rows={5}
                  className="w-full rounded-xl border border-[#2A2A2A] bg-[#121212] px-4 py-3 text-[#E0E0E0] outline-none focus:border-[#007AFF] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={posting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#007AFF] px-4 py-3 font-semibold text-white hover:opacity-90 transition disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {posting ? "Posting..." : "Post Announcement"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};