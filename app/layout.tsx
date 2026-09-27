import "./globals.css";
import AnonymousInitializer from "@/components/AnonymousInitializer";
export const metadata={title:"SERVER MONITOR",description:"Developer monitoring platform"};
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en"><body><AnonymousInitializer />{children}</body></html>;
}