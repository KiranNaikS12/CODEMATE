import React, { useLayoutEffect, useRef, useState } from "react";
import { TableProps } from "../../types/adminTypes";
import TutorDetailPageModal from "../Modals/TutorDetailsPageModal";
import UserDetailPageModal from "../Modals/UserDetailPageModal";
import { Link, useLocation } from "react-router-dom";


const Table: React.FC<TableProps> = ({ headers, data, type, selectedId, setSelectedId, tutorDetails, userDetails, isLoading, isDetailError, refetch }) => {
  const [isScrollable, setIsScrollable] = useState(false);
  const tableRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();

  useLayoutEffect(() => {
    const tableElement = tableRef.current;
    if (tableElement) {
      const scrollable = tableElement.scrollWidth > tableElement.clientWidth;

      setIsScrollable(scrollable);
    }
  }, [data]);

  const handleViewMoreClick = (id: string) => {
    setSelectedId(id);
    setTimeout(() => {
      refetch()
    }, 1000)
  }

  return (
    <div className="relative">
      {data && data.length > 0 ? (
        <div
          ref={tableRef}
          className="relative overflow-x-auto rounded-lg shadow-md"
        >

          <table className="w-full text-sm text-left text-themeColor rtl:text-right bg-themeColor">
            <thead className="text-xs uppercase text-customGrey bg-themeColor dark:bg-themeColor dark:text-gray-400">

              <tr>
                {headers.map((header, index) => (
                  <th key={index} scope="col" className="px-6 py-3">
                    {header}
                  </th>
                ))}
                <th scope="col" className="px-6 py-3">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="cursor-pointer">
              {data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`
                   ${rowIndex % 2 === 0 ? "bg-customGrey" : "bg-gray-200"}
                   border-b hover:bg-gray-300
                  `}
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-6 py-4 font-normal whitespace-nowrap"
                    >
                      {cell}
                    </td>
                  ))}
                  <td className="flex items-center px-6 py-4">
                    {type === 'problem' ? (
                      <Link
                        to={location.pathname.includes('admin') ? `/admin/edit-problem/${row[0]}` : `/view-problem/${row[0]}`}
                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                      >
                        View
                      </Link>
                    ) : (
                      <a
                        href="#"
                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                        onClick={() => {
                          handleViewMoreClick(String(row[0]));
                        }}
                      >
                        View More
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

      {isScrollable && (
        <div className="mt-2">
          <span className="text-xs text-blue-500">Scroll for more &rarr;</span>
        </div>
      )}
      {
        tutorDetails && type === 'tutor' && (
          < TutorDetailPageModal
            isOpen={Boolean(selectedId)}
            onClose={() => setSelectedId(null)}
            data={tutorDetails.data}
            isLoading={isLoading}
            isError={isDetailError}
          />
        )
      }
      {userDetails && type === 'user' && (
        <UserDetailPageModal
          isOpen={Boolean(selectedId)}
          onClose={() => setSelectedId(null)}
          data={userDetails.data}
          isLoading={isLoading}
          isError={isDetailError}
        />
      )}

    </div>
  );
};

export default Table;

