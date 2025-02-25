import { Github, Linkedin, Mail, Instagram } from "lucide-react";

function Footer() {
    return (
        <footer className="relative border-t border-gray-800/50 mt-auto">
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-gray-900 to-transparent" />
            <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col items-center">
                <div className="flex items-center gap-4 text-gray-400 ">
                    <a href="https://github.com/Ketan-33" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">
                        <Github size={35} />
                    </a>
                    <a href="https://www.linkedin.com/in/ketan-pardhi-635597267" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">
                        <Linkedin size={35} />
                    </a>
                    <a href="mailto:ketanpardhi04@gmail.com" className="hover:text-indigo-600 transition-colors">
                        <Mail size={35} />
                    </a>
                    <a href="https://www.instagram.com/_ketann33/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">
                        <Instagram size={35} />
                    </a>
                </div>
                <div className="text-center text-gray-400 mt-4">
                    &copy; {new Date().getFullYear()} Ketan Pardhi. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
export default Footer;