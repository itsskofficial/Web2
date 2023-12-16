import CardList from "@components/CardList"
import CategoryList from "@components/CategoryList"
import Featured from "@components/Featured"
import styles from "@styles/home.module.css"

const Home = () => {
  return (
    <div className={styles.container}>
      <Featured />
      <CategoryList />
      <div className={styles.content}>
        <CardList />
        <Menu />
      </div>
    </div>
  )
}

export default Home