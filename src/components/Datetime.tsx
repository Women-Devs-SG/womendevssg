import { LOCALE, SITE } from "@config";
import type { Site } from "../types";

interface DatetimesProps {
  pubDatetime: string | Date;
  modDatetime: string | Date | undefined | null;
}



interface Props extends DatetimesProps {
  size?: "sm" | "lg";
  className?: string;
  editPost?: Site["editPost"] & { disabled?: boolean };
  postId?: string;
}

export default function Datetime({
  pubDatetime,
  modDatetime,
  size = "sm",
  className = "",
  editPost,
  postId,
}: Props) {
  const activeEditPost = editPost ?? SITE.editPost;
  const editPostUrl = activeEditPost?.url;
  const showEditPost =
    !!editPostUrl &&
    !!postId &&
    !activeEditPost.disabled;

  const editLinkHref = showEditPost && editPostUrl
    ? activeEditPost.appendFilePath
      ? `${editPostUrl.replace(/\/$/, "")}/${postId}.md`
      : editPostUrl
    : undefined;

  return (
    <div
      className={`flex items-center space-x-2 opacity-80 ${className}`.trim()}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`${
          size === "sm" ? "scale-90" : "scale-100"
        } inline-block h-6 w-6 min-w-[1.375rem] fill-skin-base`}
        aria-hidden="true"
      >
        <path d="M7 11h2v2H7zm0 4h2v2H7zm4-4h2v2h-2zm0 4h2v2h-2zm4-4h2v2h-2zm0 4h2v2h-2z"></path>
        <path d="M5 22h14c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2h-2V2h-2v2H9V2H7v2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2zM19 8l.001 12H5V8h14z"></path>
      </svg>
      {modDatetime && modDatetime > pubDatetime ? (
        <span className={`italic ${size === "sm" ? "text-sm" : "text-base"}`}>
          Updated:
        </span>
      ) : (
        <span className="sr-only">Published:</span>
      )}
      <span className={`italic ${size === "sm" ? "text-sm" : "text-base"}`}>
        <FormattedDatetime
          pubDatetime={pubDatetime}
          modDatetime={modDatetime}
        />
      </span>
      {showEditPost && editLinkHref && (
        <>
          <span aria-hidden="true"> | </span>
          <a
            href={editLinkHref}
            className={`underline hover:opacity-80 ${size === "sm" ? "text-sm" : "text-base"}`}
            target="_blank"
            rel="noreferrer"
          >
            {activeEditPost?.text ?? "Edit"}
          </a>
        </>
      )}
    </div>
  );
}

const FormattedDatetime = ({ pubDatetime, modDatetime }: DatetimesProps) => {
  const myDatetime = new Date(
    modDatetime && modDatetime > pubDatetime ? modDatetime : pubDatetime
  );

  const date = myDatetime.toLocaleDateString(LOCALE.langTag, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const time = myDatetime.toLocaleTimeString(LOCALE.langTag, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <time dateTime={myDatetime.toISOString()}>{date}</time>
      <span aria-hidden="true"> | </span>
      <span className="sr-only">&nbsp;at&nbsp;</span>
      <span className="text-nowrap">{time}</span>
    </>
  );
};
