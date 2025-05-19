import { Search } from "lucide-react";
import React from "react";

export default function HistoryModal() {
  return (
    <div className="z-50 bg-slate-50 min-w-7xl max-h-8/12 p-7 rounded-lg shadow-lg inset-x-0">
      <header className="">
        <h1 className="text-xl mb-3 font-semibold">Chat History</h1>
        <div className="flex items-center gap-7 mb-7">
          <form className="block w-full">
            <input
              type="text"
              name="search"
              id="search"
              placeholder="Search"
              className="w-full border-slate-300 border focus:ring-none focus:outline-none py-1.5 px-3 rounded-md "
            />
          </form>
          <Search />
        </div>
      </header>
      <div className="flex">
        <div className="w-1/3 ">
          <ul className="space-y-3 cursor-pointer pr-7 max-h-96 overflow-y-scroll">
            <li className="hover:bg-slate-200 rounded py-2 px-5">
              Lorem ipsum dolor sit amet.
            </li>
            <li className="hover:bg-slate-200 rounded py-2 px-5">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quae,
              dignissimos?
            </li>
            <li className="hover:bg-slate-200 rounded py-2 px-5">
              Lorem ipsum dolor sit.
            </li>
            <li className="hover:bg-slate-200 rounded py-2 px-5">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit.
            </li>
            <li className="hover:bg-slate-200 rounded py-2 px-5">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit.
            </li>
            <li className="hover:bg-slate-200 rounded py-2 px-5">
              Lorem ipsum dolor sit.
            </li>
            <li className="hover:bg-slate-200 rounded py-2 px-5">
              Lorem ipsum dolor sit.
            </li>
            <li className="hover:bg-slate-200 rounded py-2 px-5">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit.
            </li>
            <li className="hover:bg-slate-200 rounded py-2 px-5">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit.
            </li>
            <li className="hover:bg-slate-200 rounded py-2 px-5">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit.
            </li>
            <li className="hover:bg-slate-200 rounded py-2 px-5">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit.
            </li>
            <li className="hover:bg-slate-200 rounded py-2 px-5">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit.
            </li>
            <li className="hover:bg-slate-200 rounded py-2 px-5">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit.
            </li>
            <li className="hover:bg-slate-200 rounded py-2 px-5">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit.
            </li>
            <li className="hover:bg-slate-200 rounded py-2 px-5">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit.
            </li>
          </ul>
        </div>
        <div className="flex-1 bg-slate-400"></div>
      </div>
    </div>
  );
}
