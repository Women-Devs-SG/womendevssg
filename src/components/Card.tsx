import { slugifyStr } from "@utils/slugify";
import type { CollectionEntry } from "astro:content";
import { LOCALE } from "@config";

export interface Props {
  href?: string;
  frontmatter: CollectionEntry<"blog">["data"];
  secHeading?: boolean;
  resources?: boolean;
}

export default function Card({ href, frontmatter, secHeading = true, resources=false }: Props) {
  const { title, pubDatetime, author, description } = frontmatter;

  const headerProps = {
    style: { viewTransitionName: slugifyStr(title) },
    className: "text-lg font-medium decoration-dashed hover:underline",
  };

  const date = pubDatetime.toLocaleDateString(LOCALE.langTag, {
    dateStyle: "medium"
  });

  return (
    <li className="my-6">
      <a
        href={href}
        className="inline-block text-lg font-medium text-skin-accent decoration-dashed underline-offset-4 focus-visible:no-underline focus-visible:underline-offset-0"
      >
        {secHeading ? (
          <h2 {...headerProps}>{title}</h2>
        ) : (
          <h3 {...headerProps}>{title}</h3>
        )}
      </a>
      {!resources && 
        <><div className="flex items-center gap-2">
          <p className="text-sm italic opacity-80">
            {author} <span aria-hidden="true">·</span>{" "}
            <time dateTime={pubDatetime.toISOString()}>{date}</time>
          </p>
        </div>
      <p>{description}</p></>}
    </li>
  );
}
