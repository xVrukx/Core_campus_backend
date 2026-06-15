import { useEffect, useState } from "react";
import { Upload, Check, FileText } from "lucide-react";
import { getUserData } from "../../RouteProtect";
import { Navbar } from "../../components/NavBar";

export const TeacherFilePage = () => {
  const user = getUserData();

  const [receivedFiles, setReceivedFiles] = useState({});
  const [openCourse, setOpenCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [message, setMessage] = useState("");

  const fetchReceivedFiles = async () => {
  try {
    if (!user?.name) return;

    const res = await fetch(
      `https://core-campus-backend.onrender.com/teacher/received-files/${encodeURIComponent(
        user.name
      )}`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch received files");
    }

    const data = await res.json();

    setReceivedFiles(data.courses || {});
  } catch (error) {
    console.error(error);
  }
};

  const fetchCourses = async () => {
    try {
      if (!user?.name) return;

      const res = await fetch(
        `https://core-campus-backend.onrender.com/teacher/files/${encodeURIComponent(user.name)}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch courses");
      }

      const data = await res.json();
      setCourses(data.courses ?? []);
    } catch (error) {
      console.error("Teacher file fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  fetchCourses();
  fetchReceivedFiles();
}, [user?.name]);

  const toggleCourse = (course) => {
    setSelectedCourses((prev) =>
      prev.includes(course)
        ? prev.filter((c) => c !== course)
        : [...prev, course]
    );
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage("Please choose a file.");
      return;
    }

    if (selectedCourses.length === 0) {
      setMessage("Please select at least one course.");
      return;
    }

    try {
      setPosting(true);
      setMessage("");

      const formData = new FormData();
      formData.append("teacherName", user?.name || "");
      formData.append("coursesName", JSON.stringify(selectedCourses));
      formData.append("file", file);

      const res = await fetch("https://core-campus-backend.onrender.com/teacher/files/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Upload failed");
      }

      setMessage("File uploaded successfully.");
      setFile(null);
      fetchReceivedFiles();
      setSelectedCourses([]);
      e.target.reset();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#E0E0E0] p-4 pb-24">
      <Navbar/>
    <div className="bg-[#1E1E1E] rounded-2xl shadow-lg p-5 mt-4">
      <h2 className="text-xl font-semibold text-[#FF9500] mb-4">
        Received Student Files
      </h2>

      {Object.keys(receivedFiles).length === 0 ? (
        <div className="text-[#8E8E93]">
          No student files received.
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(receivedFiles).map(
            ([course, files]) => (
              <div
                key={course}
                className="bg-[#121212] rounded-2xl border border-[#2A2A2A] overflow-hidden"
              >
                <button
                  onClick={() =>
                    setOpenCourse(
                      openCourse === course
                        ? null
                        : course
                    )
                  }
                  className="
                    w-full
                    px-4
                    py-4
                    flex
                    justify-between
                    items-center
                    hover:bg-[#242424]
                    transition
                  "
                >
                  <span className="font-semibold">
                    {course}
                  </span>

                  <span className="text-[#007AFF] text-xl">
                    {openCourse === course
                      ? "−"
                      : "+"}
                  </span>
                </button>

                {openCourse === course && (
                  <div className="border-t border-[#2A2A2A] p-4 space-y-3">
                    {files.map((file) => (
                      <div
                        key={file._id}
                        className="
                          bg-[#1E1E1E]
                          rounded-xl
                          p-4
                          flex
                          justify-between
                          items-center
                        "
                      >
                        <div>
                          <p className="font-semibold">
                            {file.studentName}
                          </p>

                          <p className="text-sm text-[#8E8E93]">
                            {file.file.originalName}
                          </p>
                        </div>

                        <a
                          href={`https://core-campus-backend.onrender.com${file.file.url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="
                            px-3
                            py-2
                            rounded-xl
                            bg-[#007AFF]
                            text-white
                            text-sm
                          "
                        >
                          Open
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
          <div className="bg-[#1E1E1E] rounded-2xl shadow-lg p-5 text-center mb-4">
        <h1 className="text-3xl font-bold text-[#007AFF]">CampusCore</h1>
        <p className="text-[#8E8E93] mt-2">Upload Files</p>
      </div>

      <div className="bg-[#1E1E1E] rounded-2xl shadow-lg p-5 mb-4">
        <h2 className="text-xl font-semibold text-[#FF9500] mb-4">
          Select Courses
        </h2>

        {loading ? (
          <div className="text-[#8E8E93]">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="text-[#8E8E93]">No assigned courses found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {courses.map((item) => {
              const checked = selectedCourses.includes(item.course);

              return (
                <button
                  key={item.course}
                  type="button"
                  onClick={() => toggleCourse(item.course)}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-4 transition ${
                    checked
                      ? "border-[#007AFF] bg-[#007AFF]/15"
                      : "border-[#2A2A2A] bg-[#121212] hover:bg-[#242424]"
                  }`}
                >
                  <div className="text-left">
                    <p className="font-semibold">{item.course}</p>
                    <p className="text-sm text-[#8E8E93] capitalize">
                      {item.subject.replaceAll("_", " ")}
                    </p>
                  </div>

                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${
                      checked ? "bg-[#007AFF]" : "bg-[#2A2A2A]"
                    }`}
                  >
                    {checked && <Check className="h-4 w-4 text-white" />}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-[#1E1E1E] rounded-2xl shadow-lg p-5">
        <h2 className="text-xl font-semibold text-[#FF9500] mb-4">
          Upload File
        </h2>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="rounded-2xl border border-dashed border-[#2A2A2A] bg-[#121212] p-5">
            <label className="mb-2 block text-sm text-[#8E8E93]">
              Choose File
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-sm text-[#E0E0E0]"
            />
            {file && (
              <p className="mt-3 text-sm text-[#8E8E93]">
                Selected: {file.name}
              </p>
            )}
          </div>

          {message && (
            <div className="rounded-xl bg-[#121212] px-4 py-3 text-sm text-[#8E8E93]">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={posting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#007AFF] px-4 py-3 font-semibold text-white hover:opacity-90 transition disabled:opacity-60"
          >
            <Upload className="h-4 w-4" />
            {posting ? "Uploading..." : "Send File"}
          </button>
        </form>
      </div>
    </div>
  );
};