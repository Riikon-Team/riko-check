import React from 'react'
import { Link } from 'react-router-dom'

function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center mb-4">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold  dark:text-gray-100">RikoCheck</span>
                        </div>
                        <p className=" dark:text-gray-400 mb-4 max-w-md">
                            Hệ thống quản lý điểm danh thông minh, giúp tổ chức sự kiện một cách hiệu quả và chính xác.
                        </p>
                        <div className="flex space-x-4">
                            <a
                                href="https://github.com/Riikon-Team"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover: dark:hover:text-gray-300 transition-colors"
                                aria-label="GitHub"
                                title="GitHub"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.586 2 12.242c0 4.513 2.865 8.336 6.839 9.688.5.094.683-.222.683-.49 0-.242-.01-.884-.014-1.735-2.782.616-3.369-1.37-3.369-1.37-.455-1.173-1.11-1.485-1.11-1.485-.907-.637.069-.624.069-.624 1.003.072 1.53 1.05 1.53 1.05.892 1.558 2.341 1.108 2.91.846.091-.658.35-1.108.636-1.363-2.221-.26-4.557-1.136-4.557-5.056 0-1.117.389-2.03 1.026-2.746-.103-.26-.445-1.308.097-2.726 0 0 .84-.27 2.75 1.05a9.33 9.33 0 0 1 2.503-.343c.85.004 1.706.117 2.503.343 1.91-1.32 2.748-1.05 2.748-1.05.543 1.418.201 2.466.099 2.726.639.716 1.025 1.629 1.025 2.746 0 3.93-2.339 4.792-4.566 5.046.357.314.675.933.675 1.88 0 1.357-.013 2.451-.013 2.783 0 .27.18.588.689.488C19.138 20.575 22 16.754 22 12.242 22 6.586 17.523 2 12 2Z" clipRule="evenodd" />
                                </svg>
                            </a>
                            <a
                                href="https://riikonteam.io.vn/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover: dark:hover:text-gray-300 transition-colors"
                                aria-label="Website"
                                title="Website"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2Zm6.938 9a7.97 7.97 0 0 0-1.42-3.43A8.006 8.006 0 0 0 15.1 9h3.838ZM14.5 9h-5c.39-1.64 1.143-3.02 2-3.874.857.855 1.61 2.233 2 3.874ZM9 10.5h6a12.3 12.3 0 0 1-.18 3H9.18A12.3 12.3 0 0 1 9 10.5Zm-1.6-1.5a8.006 8.006 0 0 0-2.418-1.86A7.97 7.97 0 0 0 5.062 11H8.9c-.21-.7-.35-1.462-.5-2.233ZM5.062 13A7.97 7.97 0 0 0 5.98 16.43c.61-.79 1.36-1.47 2.42-1.93-.15-.77-.29-1.54-.5-2.5H5.062Zm3.838 0c.39 1.64 1.143 3.02 2 3.874.857-.855 1.61-2.233 2-3.874h-4Zm5.2 0c-.21.96-.35 1.73-.5 2.5 1.06.46 1.81 1.14 2.42 1.93A7.97 7.97 0 0 0 18.938 13H14.1Zm-2.6 5.374C10.643 17.52 9.89 16.142 9.5 14.5h5c-.39 1.642-1.143 3.02-2 3.874Z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-semibold  dark:text-gray-100 uppercase tracking-wider mb-4">
                            Liên kết nhanh
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    to="/"
                                    className=" dark:text-gray-400 hover: dark:hover:text-gray-100 transition-colors text-sm"
                                >
                                    Trang chủ
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/dashboard"
                                    className=" dark:text-gray-400 hover: dark:hover:text-gray-100 transition-colors text-sm"
                                >
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/event/create"
                                    className=" dark:text-gray-400 hover: dark:hover:text-gray-100 transition-colors text-sm"
                                >
                                    Tạo sự kiện
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/admin"
                                    className=" dark:text-gray-400 hover: dark:hover:text-gray-100 transition-colors text-sm"
                                >
                                    Quản trị
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-sm font-semibold  dark:text-gray-100 uppercase tracking-wider mb-4">
                            Hỗ trợ
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <a
                                    href="#"
                                    className=" dark:text-gray-400 hover: dark:hover:text-gray-100 transition-colors text-sm"
                                >
                                    Hướng dẫn sử dụng
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className=" dark:text-gray-400 hover: dark:hover:text-gray-100 transition-colors text-sm"
                                >
                                    FAQ
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className=" dark:text-gray-400 hover: dark:hover:text-gray-100 transition-colors text-sm"
                                >
                                    Liên hệ hỗ trợ
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className=" dark:text-gray-400 hover: dark:hover:text-gray-100 transition-colors text-sm"
                                >
                                    Báo cáo lỗi
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 md:mb-0">
                            © {currentYear} RikoCheck. Tất cả quyền được bảo lưu.
                        </div>
                        <div className="flex space-x-6 text-sm text-gray-500 dark:text-gray-400">
                            <a
                                href="#"
                                className="hover: dark:hover:text-gray-100 transition-colors"
                            >
                                Chính sách bảo mật
                            </a>
                            <a
                                href="#"
                                className="hover: dark:hover:text-gray-100 transition-colors"
                            >
                                Điều khoản sử dụng
                            </a>
                            <a
                                href="#"
                                className="hover: dark:hover:text-gray-100 transition-colors"
                            >
                                Sitemap
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
