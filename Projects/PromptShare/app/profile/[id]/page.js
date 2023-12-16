"use client"

import Profile from "@components/Profile"
import {useRouter, useSearchParams} from "next/navigation"
import { useEffect, useState } from "react"

const MyProfile = () => {
    const [posts, setPosts] = useState([])
    const router = useRouter()
    const searchParams = useSearchParams()
    const userName = searchParams.get('name')

    useEffect(() => {
        const fetchPosts = async () => {
            const response = await fetch(`/api/users/${params?.id}/posts`)
            const data = await response.json()
            setPosts(data)
        }
        
        if(params.id)
            fetchPosts()
    }, []);
   
    const handleEdit = (post) => {
        router.push(`/update-prompt?id=${post._id}`)
    }

    const handleDelete = async (post) => {
        const hasConfirmed = confirm("Are you sure you want to delete this prompt?")
        if (hasConfirmed) {
            try {
                await fetch(`/api/prompt/${post._id.toString()}`, {
                    method : "DELETE"
                })

                const filteredPosts = posts.filter((p) => p._id !== post._id)
                setPosts(filteredPosts)
            }
            catch (error) {
                console.log(error)
            }
        }
        
    }

    return (
        <Profile name={userName} desc={`Welcome to ${userName}'s profile page`} data ={posts} onEdit = {handleEdit} onDelete = {handleDelete} />
    );
}
 
export default MyProfile;