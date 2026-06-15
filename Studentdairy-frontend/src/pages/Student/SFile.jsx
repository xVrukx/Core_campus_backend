import { useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";
import { getUserData } from "../../RouteProtect";
import { Navbar } from "../../components/NavBar";

export const SFile = () => {
  const user = getUserData();

  const [course, setCourse] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = async () => {
    try {
      if (!user?.name) return;

      const res = await fetch(
        `http://localhost:5000/student/files/${encodeURIComponent(user.name)}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch files");
      }

      const data = await res.json();
      setCourse(data.course ?? "");
      setFiles(data.files ?? []);
    } catch (error) {
      console.error("Student file fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [user?.name]);

  const getFileUrl = (filePath) => {
    if (!filePath) return "#";
    if (filePath.startsWith("http")) return filePath;
    return `http://localhost:5000${filePath}`;
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E0E0] p-4 pb-24">
      <Navbar/>
      <div className="bg-[#1E1E1E] rounded-2xl shadow-lg p-5 text-center mb-4">
        <h1 className="text-3xl font-bold text-[#007AFF]">CampusCore</h1>
        <p className="text-[#8E8E93] mt-2">{user?.name}</p>
        <p className="text-sm text-[#8E8E93] mt-1">Course: {course}</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="bg-[#1E1E1E] rounded-2xl p-5 text-center text-[#8E8E93]">
            Loading files...
          </div>
        ) : files.length === 0 ? (
          <div className="bg-[#1E1E1E] rounded-2xl p-5 text-center text-[#8E8E93]">
            No files available.
          </div>
        ) : (
          files.map((item) => (
            <div
              key={item._id}
              className="bg-[#1E1E1E] rounded-2xl shadow-lg p-5 border border-[#2A2A2A]"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h2 className="text-lg font-semibold text-[#FF9500]">
                    {item.file.originalName}
                  </h2>
                  <p className="text-xs text-[#8E8E93] mt-1">
                    By {item.teacherName} •{" "}
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>

                <FileText className="h-5 w-5 text-[#007AFF] shrink-0" />
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {item.coursesName.map((c) => (
                  <span
                    key={c}
                    className="rounded-full bg-[#007AFF]/15 px-3 py-1 text-xs text-[#007AFF]"
                  >
                    {c}
                  </span>
                ))}
              </div>

              <a
                href={getFileUrl(item.file.url)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#007AFF] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
              >
                <Download className="h-4 w-4" />
                Download
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
};