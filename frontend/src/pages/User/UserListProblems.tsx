import React, { useState, useEffect } from "react";
import Header from "../../components/Headers/Header";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Pointer,
  Search,
  Settings,
  Shuffle,
  CircleOff
} from "lucide-react";
import { Problem, SubmissionStats } from "../../types/problemTypes";
import { TableRow } from "../../types/types";
import Table from "../../components/Tables/Table";
import { useGetProblemsQuery } from "../../services/userApiSlice";
import useThrottle from "../../hooks/useThrottle";
import { filterOptionsByTags } from "../../types/problemTypes";
import { filterOptionsByLevel } from "../../types/problemTypes";
import { sortOptions } from "../../types/problemTypes";
import { filterOptionsByStatus } from "../../types/problemTypes";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

const UserListProblems: React.FC = () => {
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const userId = userInfo?._id.toString()
  const headers: string[] = ["ID", "STATUS", "SlNO", "TITLE", "LEVEL", "TAG", "RATINGS"];
  const [localProblems, setLocalProblems] = useState<Problem[]>([]);
  const [displayProblems, setDisplayProblems] = useState<Problem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [isPickOne, setIsPickOne] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tagDropdown, setTagDropdown] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const throttledSearchTerm = useThrottle(searchTerm, 300);

  const { data, refetch } = useGetProblemsQuery({
    searchTerm: throttledSearchTerm,
    sortOption,
    filterTag: selectedTag,
    filterLevel: selectedLevel,
    page,
    limit,
  });

  useEffect(() => {
    if (data) {
      const problems = [...data.data].filter((data) => !data.isBlock);
      if (problems) {
        setLocalProblems(problems);
        setDisplayProblems(problems);
        if (data.total) {
          setTotalCount(data.total);
        }
      }
    }
  }, [data]);

  useEffect(() => {
    if (throttledSearchTerm) {
      // console.log("Searching for:", throttledSearchTerm);
      refetch(); // Trigger the API refetch when throttledSearchTerm changes
    }
  }, [throttledSearchTerm, refetch]);

  const pickOneRandom = () => {
    setIsPickOne(true);
    const randomIndex = Math.floor(Math.random() * displayProblems.length);
    setDisplayProblems([displayProblems[randomIndex]]);
  };

  const resetDisplay = () => {
    setIsPickOne(false);
    setDisplayProblems(localProblems);
  };

  const shuffleProblem = () => {
    setIsPickOne(false);
    const shuffledProblem = [...displayProblems]
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
    setDisplayProblems(shuffledProblem);
  };

  const toggleDropDown = () => {
    setTagDropdown(!tagDropdown);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const resetTagFilter = () => {
    setSelectedTag([]);
    setTagDropdown(false);
  };


  const getFinalOrLatestSubmission = (submission: SubmissionStats[], userId: string) => {
    if(!submission || submission.length === 0) return null;
    
    const finalSubmission = submission.find(
      sub => sub.user.toString() === userId && sub.isFinal
    );

    if(finalSubmission) {
      return finalSubmission;
    }

    const userSubmission = submission
    .filter(sub => sub.user.toString() === userId)
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime(); 
      const dateB = new Date(b.createdAt).getTime(); 
      return dateB - dateA; 
    })

    return userSubmission.length > 0 ? userSubmission[0] : null
  }


  const tableRow: TableRow[] = displayProblems.map((problem: Problem) => [
    problem._id,
    <span>
  {problem.submission && problem.submission.length > 0 && (() => {
    const submission = getFinalOrLatestSubmission(problem.submission, userId!);

    if (submission) {
      return submission.status === 'Accepted' ? (
        <CheckCircle size={16} style={{ color: 'green' }} />
      ) : submission.status === 'Attempted' ? (
        <CircleOff size={16} style={{ color: 'yellow' }} />
      ) : null;
    }

    return null;
  })()}
</span>,
    problem.slno,
    problem.title,
    <span
      className={`${problem.difficulty === "easy"
        ? "text-green-600"
        : problem.difficulty === "medium"
          ? "text-yellow-500"
          : "text-red-500"
        }`}
    >
      {problem.difficulty}
    </span>,
    `${problem.tags}`,
    `⭐ ${problem.averageRatings}`
  ]);

  const totalPage = Math.ceil(totalCount / limit);

  return (
    <div className="flex flex-col w-full min-h-screen bg-customGrey">
      <Header />
      <div className="flex flex-col w-full px-4 md:px-8 lg:px-12">
        {/* Header Section */}
        <div className="w-full max-w-[1400px] mx-auto mt-2">
          <div className="flex flex-col justify-between mb-6 sm:flex-row sm:items-center">
            <h1 className="flex items-center mb-4 text-2xl font-semibold sm:mb-0 text-themeColor">
              PROBLEM LISTS
              <span className="px-3 py-1 ml-2 text-sm font-medium border border-gray-400 rounded-full shadow-inner text-hoverColor">
                Total: {displayProblems.length}
              </span>
            </h1>
            {isPickOne && (
              <button
                className="text-sm font-medium text-hoverColor"
                onClick={resetDisplay}
              >
                Show All
              </button>
            )}
          </div>

          {/* Search bar and other items... */}
          <div className="w-full mb-6 overflow-x-auto">
            <div className="flex items-center gap-3 min-w-max">
              <div className="relative flex-1 min-w-[200px]">
                <Search
                  className="absolute text-gray-500 transform -translate-y-1/2 left-4 top-1/2"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="search questions..."
                  value={searchTerm.toLowerCase()}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 pl-10 bg-white border rounded-lg border-customGrey focus:outline-none focus:border-hoverColor"
                />
              </div>

              {/* Tags */}
              <div>
                <div>
                  <button
                    type="button"
                    onClick={toggleDropDown}
                    className="w-full p-2 bg-white rounded-md"
                  >
                    <div className="flex items-center w-full gap-2 justify-evenly">
                      <span>Tags</span>
                      <span>
                        {tagDropdown ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </span>
                    </div>
                  </button>
                </div>
                {tagDropdown && (
                  <div className="absolute z-50 grid grid-cols-4 gap-2 p-4 mt-2 bg-white border rounded-md shadow-lg">
                    {/* Container for tags */}
                    <div className="grid grid-cols-4 col-span-4 gap-2">
                      {filterOptionsByTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => handleTagClick(tag)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-colors duration-200 ${selectedTag.includes(tag)
                            ? "bg-themeColor text-white"
                            : "bg-customGrey text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                    <div className="flex col-span-4 mt-2">
                      <h1
                        className="text-sm text-blue-500 cursor-pointer"
                        onClick={resetTagFilter}
                      >
                        Reset
                      </h1>
                    </div>
                  </div>
                )}
              </div>

              {/* Difficulty */}
              <select
                value={selectedLevel.toLowerCase()}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-32 p-2 bg-white border rounded-lg border-customGrey focus:outline-none focus:border-hoverColor"
              >
                <option value="">Difficulty</option>
                {filterOptionsByLevel.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              {/* Status */}
              <select className="w-32 p-2 bg-white border rounded-lg border-customGrey focus:outline-none focus:border-hoverColor">
                <option value="">Status</option>
                {filterOptionsByStatus.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              {/* Sort By */}
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-32 p-2 bg-white border rounded-lg border-customGrey focus:outline-none focus:border-hoverColor"
              >
                <option value="">Sort By</option>
                {sortOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              {/* Shuffle Button */}
              <button
                onClick={shuffleProblem}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 bg-white border rounded-lg whitespace-nowrap border-customGrey focus:outline-none focus:border-hoverColor"
              >
                <Shuffle size={20} />
                <span className="hidden sm:inline">Shuffle</span>
              </button>

              {/* Pick One Button */}
              <button
                onClick={pickOneRandom}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 bg-white border rounded-lg whitespace-nowrap border-customGrey focus:outline-none focus:border-hoverColor"
              >
                <Pointer size={20} />
                <span className="hidden sm:inline">Pick One</span>
              </button>

              <button className="flex items-center justify-center p-2 ml-auto bg-white border rounded-lg border-customGrey focus:outline-none focus:border-hoverColor">
                <Settings size={22} className="font-thin text-gray-600" />
              </button>
            </div>
            {selectedTag && selectedTag.length > 0 && (
              <div className="flex gap-2 px-2 py-2 text-blue-500">
                {filterOptionsByTags
                  .filter((tag) => selectedTag.includes(tag))
                  .map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className="px-3 py-1.5 rounded-lg text-sm transition-colors duration-200 bg-themeColor text-white"
                    >
                      {tag}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Table Section */}
          {displayProblems.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <Table
                headers={headers}
                type="problem"
                data={tableRow}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
                refetch={refetch}
              />
            </div>
          ) : (
            <div className="relative flex items-center mt-20 justify-evenly">
              <img
                src="/not_found.png"
                alt="not_found"
                className="w-96 h-w-96"
              />
              <div className="absolute -bottom-6">
                <h1 className="text-2xl text-gray-400">
                  Sorry! No result found.
                </h1>
              </div>
            </div>
          )}

          {displayProblems.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div>
                {/* limitSelection */}
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="px-3 py-2 ml-0 border border-gray-400 rounded-lg shadow-none bg-customGrey focus:outline-none focus:border-hoverColor"
                >
                  {[6, 8].map((size) => (
                    <option key={size} value={size}>
                      Show {size} rows per page
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-center gap-x-2">
                {/* previous */}
                <button
                  disabled={page === 1}
                  onClick={() =>
                    setPage((prevPage) => Math.max(prevPage - 1, 1))
                  }
                  className={`px-4 py-2 bg-gray-300 rounded-md ${page === 1
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-400"
                    }`}
                >
                  Previous
                </button>

                <div className="flex gap-2">
                  {[...Array(totalPage)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setPage(index + 1)}
                      className={`px-4 py-2 rounded-md ${page === index + 1
                        ? "bg-blue-500 text-white"
                        : "bg-gray-300 hover:bg-gray-400"
                        }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                {/* next */}
                <button
                  disabled={page === totalPage}
                  onClick={() =>
                    setPage((prevPage) => Math.min(prevPage + 1, totalPage))
                  }
                  className={`px-4 py-2 bg-gray-300 rounded-md ${page === totalPage
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-400"
                    }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
          {/* pagination */}
        </div>
      </div>
    </div>
  );
};

export default UserListProblems;
