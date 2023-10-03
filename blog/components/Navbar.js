import styles from "@styles/navbar.module.css"
import Image from "next/image"

const Navbar = () => {
    return (  
        <div className = {styles.container}>
            <div className={styles.socials}>
                <Image src="/facebook.png" alt="facebook" width={24} height={24} />
                <Image src="/instagram.png" alt="instagram" width={24} height={24} />
                <Image src="/youtube.png" alt="youtube" width={24} height={24} />
            </div>
            <div className={styles.logo}>

            </div>
            <div className={styles.links}>

            </div>
        </div>
    )
}
 
export default Navbar