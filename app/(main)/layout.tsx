import { Navbar } from "@/components/navbar/navbar";

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen min-h-0 flex-col">
            <Navbar />
            {children}
        </div>
    )
}