function SpeakerTags({ tags }: { tags: string[] }) {

  const toggleTagFilter = (tag: string) => {
    window.dispatchEvent(new CustomEvent('tag-toggled', { detail: tag }));
  };
  return (
    <div className='flex flex-wrap gap-2 mt-4'>
      {tags.map((tag, index) => (
        <p
          key={index}
          className='px-2 py-0.5 bg-blue-500 hover:bg-blue-700 font-medium text-sm rounded-xl cursor-pointer'
          onClick={() => toggleTagFilter(tag)}
        >
          #{tag}
        </p>
      ))}
    </div>
  );
}

export default SpeakerTags;