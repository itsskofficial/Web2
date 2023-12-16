import PromptCard from "./PromptCard";

const Profile = ({ name, desc, data, onEdit, onDelete}) => {
    return (
        <section className="w-full">
            <h1 className = "head_text text-left">
                <span className = "blue_gradient">{name} Profile</span>
            </h1>
            <p className = "desc text-left">
                {desc}
            </p>
            <div className="mt-16 prompt-layout">
                {data.map((post) => (
                    <PromptCard key={post._id} post={post} onEdit= {() => onEdit && onEdit(post)} onDelete = {() => onDelete && onDelete(post)} />
                ))}
            </div>
        </section>
    );
}
 
export default Profile;