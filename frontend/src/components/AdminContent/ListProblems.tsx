import React, { useEffect, useState } from "react";
import { Plus, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { ChevronDown, ChevronUp } from "lucide-react";
import { filterOptionsByTags } from "../../types/problemTypes";
import { filterOptionsByLevel } from "../../types/problemTypes";
import { sortOptions } from "../../types/problemTypes";
import {
  useGetProblemsQuery,
  useUpdateProblemStatusMutation,
} from "../../services/adminApiSlice";
import { Problem, Tag } from "../../types/problemTypes";
import { APIError } from "../../types/types";
import Table from "../Tables/Table";
import { TableRow } from "../../types/types";
import useThrottle from "../../hooks/useThrottle";
import Swal from "sweetalert2";

const ListProblems: React.FC = () => {
  const headers: string[] = [
    "ID",
    "SlNO",
    "TITLE",
    "LEVEL",
    "CREATED_AT",
    "STATUS",
  ];

  const [localProblems, setLocalProblems] = useState<Problem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<Tag[]>([]);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [tagDropdown, setTagDropdown] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [totalCount, setTotalCount] = useState(0);
  const [shouldRefetch, setShouldRefetch] = useState(true);
  const throttledSearchTerm = useThrottle(searchTerm, 300);

  const { data, refetch } = useGetProblemsQuery({
    searchTerm: throttledSearchTerm,
    sortOption,
    filterTag: selectedTag,
    filterLevel: selectedLevel,
    page,
    limit,
  }, {
    skip: !shouldRefetch
  });
  const [updateProblemStatus] = useUpdateProblemStatusMutation();

  useEffect(() => {
    if (data) {
      setLocalProblems(data.data);
      if (data.total) {
        setTotalCount(data.total);
      }
    }
  }, [data]);

  const resetToDefault = () => {
    setSearchTerm("");
    setSelectedLevel("");
    setSelectedTag([]);
    setSortOption("");
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

  const totalPage = Math.ceil(totalCount / limit);

  const toggleProblemBlock = async (problemId: string, isBlock: boolean) => {
    const action = isBlock ? "unblocked" : "blocked";
    setShouldRefetch(false)
    try {
      const result = await Swal.fire({
        title: `Are you sure you want to ${action} this tutor?`,
        text: `This action will ${action} the tutor's account.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: `Yes, ${action} it!`,
        cancelButtonText: 'Cancel'
      });

      if(result.isConfirmed) {
        const response = await updateProblemStatus({
          id: problemId,
          isBlock: !isBlock,
        }).unwrap();
        if (response) {
          setLocalProblems((prev) =>
            prev.map((problem) =>
              problem._id === problemId
                ? { ...problem, isBlock: !isBlock }
                : problem
            )
          );
  
          const textColor = isBlock ? "green" : "red";
          toast.success(`Problem ${action} successfully`, {
            style: {
              color: textColor,
            },
          });
          await refetch();
        }
      } else {
        toast.info('Action canceled')
      }
    } catch (error) {
      const apiError = error as APIError;
      if (apiError.data && apiError.data.message) {
        toast.error(apiError.data.message);
      }
    } finally {
      setShouldRefetch(true)
    }
  };

  const problemRows: TableRow[] = localProblems.map((problem: Problem) => [
    problem._id,
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
    new Date(problem.createdAt).toLocaleDateString(),
    <div className="relative group" key={problem._id}>
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={problem.isBlock}
          onChange={() => toggleProblemBlock(problem._id, problem.isBlock)}
          className="hidden"
        />
        <div
          className={`w-12 flex items-center rounded-full p-1 transition duration-1000 ease-in-out ${problem.isBlock ? "bg-red-500" : "bg-green-500"
            }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-300 ease-in-out ${problem.isBlock ? "translate-x-6" : ""
              }`}
          ></div>
        </div>
      </label>
      <div
        className={`absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 rounded bg-customGrey text-themeColor text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      >
        {problem.isBlock ? "Problem is blocked" : "problem is active"}
      </div>
    </div>,
  ]);

  return (
    <div className="flex flex-col min-h-screen p-2">
      <Toaster
        position="top-center"
        toastOptions={{ style: { backgroundColor: "#D8D8FD" } }}
        richColors
      />
      <div className="flex-grow">
        <h1 className="flex items-center mb-4 text-2xl font-semibold">
          LIST OF PROBLEMS
          <span className="px-3 py-1 ml-2 text-sm font-medium border border-gray-400 rounded-full shadow-inner text-hoverColor">
            Total: {localProblems.length}
          </span>
        </h1>
        <div className="flex items-center justify-between mb-4">
          <input
            type="text"
            placeholder="Search by title/slno..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 bg-white border rounded-lg shadow-xl border-customGrey md:w-1/2 focus:outline-none focus:border-hoverColor"
          />
          <div className="flex ml-2 gap-x-2">
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
            <select
              className="p-2 bg-white border rounded-lg shadow-xl border-customGrey focus:outline-none focus:border-hoverColor"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              <option value="">Filter by Level</option>
              {filterOptionsByLevel.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select
              className="p-2 bg-white border rounded-lg shadow-xl border-customGrey focus:outline-none focus:border-hoverColor"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="">Sort by</option>
              {sortOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <button className="mr-2" onClick={resetToDefault}>
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
        <div>
          <Table
            headers={headers}
            type="problem"
            data={problemRows}
            problemDetails={data?.data}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            refetch={refetch}
          />
        </div>
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
              onClick={() => setPage((prevPage) => Math.max(prevPage - 1, 1))}
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
      </div>
      <Link to="/admin/add-problems">
        <button className="fixed flex items-center px-2 py-2 mb-6 mr-6 text-base border rounded-lg shadow-lg border-hoverColor text-customGrey bottom-3 right-6 hover:bg-customGrey hover:text-themeColor gap-x-2 bg-themeColor">
          Add Problems
          <div className="p-1 border rounded-full border-highlightBlue bg-customGrey hover:bg-customGrey ">
            <Plus className="w-4 h-4 md:w-5 md:h-5 text-themeColor" />
          </div>
        </button>
      </Link>
    </div>
  );
};

export default ListProblems;
