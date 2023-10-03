import styles from "@styles/cardList.module.css"
import Pagination from "./Pagination"

const CardList = () => {
    return (  
        <div className = {styles.container}>
            <Pagination />
        </div>
    )
}
 
export default CardList