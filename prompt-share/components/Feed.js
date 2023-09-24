"use client"

import { useEffect, useState } from "react";
import PromptCard from "./PromptCard";

const PromptCardList = ({ data, onTagClick }) => {
    return (
        <div className="mt-16 prompt-layout">
            {data.map((post) => (
                <PromptCard key = {post._id} post = {post} onTagClick = {onTagClick} />
            ))}
        </div>
    )
}
const Feed = () => {
    const [searchText, setSearchText] = useState("");
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [posts, setPosts] = useState([]);
    const [searchedResults, setSearchedResults] = useState([]);

    const handleSearchChange = (e) => {
        clearTimeout(searchTimeout);
        setSearchText(e.target.value);
    
        setSearchTimeout(
          setTimeout(() => {
            const results = filterPrompts(e.target.value);
            setSearchedResults(results);
          }, 500)
        );
    } 

    const filterPrompts = (searchtext) => {
        const regex = new RegExp(searchtext, "i"); 
        return posts.filter(
          (item) =>
            regex.test(item.creator.username) ||
            regex.test(item.tag) ||
            regex.test(item.prompt)
        );
    };

    const handleTagClick = (tagName) => {
        setSearchText(tagName)
        const results = filterPrompts(tagName)
        setSearchedResults(results)
    }
    

    useEffect(() => {
        const fetchPosts = async () => {
            const response = await fetch('/api/prompt')
            const data = await response.json()
            setPosts(data)
        }

        fetchPosts()
    }, []);

    return (
        <section className="feed">
            <form className="relative w-full flex-center">
                <input type = "text" placeholder = "Search for anything" value = {searchText} onChange = {handleSearchChange} required className = "search_input peer" />
            </form>
            {searchText ?
                <PromptCardList data={searchedResults} onTagClick={handleTagClick} /> :
                <PromptCardList data={posts} onTagClick={handleTagClick} />
            }
        </section>
    );
}
 
export default Feed;