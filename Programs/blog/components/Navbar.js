import styles from "@styles/navbar.module.css"
import Image from "next/image"
import ThemeToggle from "./ThemeToggle"
import AuthLinks from "./AuthLinks"

const Navbar = () => {
    return (  
        <div className = {styles.container}>
            <div className={styles.socials}>
                <Image src="/facebook.png" alt="facebook" width={24} height={24} />
                <Image src="/instagram.png" alt="instagram" width={24} height={24} />
                <Image src="/youtube.png" alt="youtube" width={24} height={24} />
            </div>
            <div className={styles.logo}>
                SK's Blog
            </div>
            <ThemeToggle />
            <div className={styles.links}>
                <Link href="/">
                    Home
                </Link>
                <Link href="/about">
                    About
                </Link>
                <Link href="/about">
                    Contact
                </Link>
            </div>
            <AuthLinks />
        </div>
    )
}
 
export default Navbar