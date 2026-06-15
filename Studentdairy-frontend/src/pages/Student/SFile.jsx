import { useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";
import { getUserData } from "../../RouteProtect";
import { Navbar } from "../../components/NavBar";

export const SFile = () => {
  const user = getUserData();

  const [teachers, setTeachers] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [course, setCourse] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTeachers = async () => {
    try {
      const res = await fetch(
        `https://core-campus-backend.onrender.com/student/teachers/${encodeURIComponent(
          user.name
        )}`
      );

      const data = await res.json();

      setTeachers(data.teachers || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchFiles = async () => {
    try {
      if (!user?.name) return;

      const res = await fetch(
        `https://core-campus-backend.onrender.com/student/files/${encodeURIComponent(user.name)}`
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
  fetchTeachers();
}, [user?.name]);

  const toggleTeacher = (teacherName) => {
    setSelectedTeachers((prev) =>
      prev.includes(teacherName)
        ? prev.filter((t) => t !== teacherName)
        : [...prev, teacherName]
    );
  };

  const handleStudentUpload = async (e) => {
    e.preventDefault();

    if (!uploadFile) {
      setUploadMessage("Choose a file.");
      return;
    }

    if (selectedTeachers.length === 0) {
      setUploadMessage("Select at least one teacher.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("studentName", user.name);
      formData.append(
        "teachers",
        JSON.stringify(selectedTeachers)
      );
      formData.append("file", uploadFile);

      const res = await fetch(
        "https://core-campus-backend.onrender.com/student/upload-file",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setUploadMessage("File sent successfully.");
      setSelectedTeachers([]);
      setUploadFile(null);

    } catch (error) {
      setUploadMessage(error.message);
    } finally {
      setUploading(false);
    }
  };
    const getFileUrl = (filePath) => {
      if (!filePath) return "#";
      if (filePath.startsWith("http")) return filePath;
    return `https://core-campus-backend.onrender.com${filePath}`;
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
      <div className="bg-[#1E1E1E] rounded-2xl shadow-lg p-5 mt-4">
        <h2 className="text-xl font-semibold text-[#FF9500] mb-4">
          Select Teachers
        </h2>

        {teachers.length === 0 ? (
          <div className="text-[#8E8E93]">
            No teachers available.
          </div>
        ) : (
          <div className="grid gap-3">
            {teachers.map((teacher) => {
              const selected =
                selectedTeachers.includes(teacher.name);

              return (
                <button
                  key={teacher._id}
                  type="button"
                  onClick={() =>
                    toggleTeacher(teacher.name)
                  }
                  className={`flex justify-between items-center rounded-2xl px-4 py-4 border transition ${
                    selected
                      ? "border-[#007AFF] bg-[#007AFF]/15"
                      : "border-[#2A2A2A] bg-[#121212]"
                  }`}
                >
                  <div className="text-left">
                    <p className="font-semibold">
                      {teacher.name}
                    </p>

                    <p className="text-sm text-[#8E8E93]">
                      {teacher.Subject}
                    </p>
                  </div>

                  {selected && (
                    <span className="text-[#007AFF]">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div className="bg-[#1E1E1E] rounded-2xl shadow-lg p-5 mt-4">
        <h2 className="text-xl font-semibold text-[#FF9500] mb-4">
          Send File To Teacher
        </h2>

        <form
          onSubmit={handleStudentUpload}
          className="space-y-4"
        >
          <input
            type="file"
            onChange={(e) =>
              setUploadFile(e.target.files[0])
            }
            className="w-full"
          />

          {uploadMessage && (
            <div className="rounded-xl bg-[#121212] p-3 text-sm text-[#8E8E93]">
              {uploadMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="
              w-full
              rounded-xl
              bg-[#007AFF]
              px-4
              py-3
              text-white
              font-semibold
            "
          >
            {uploading
              ? "Uploading..."
              : "Send File"}
          </button>
        </form>
      </div>
          </div>
  );
};