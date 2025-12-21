import Swal from 'sweetalert2';

type ConfirmOptions = {
    title?: string;
    text?: string;
    confirmText?: string;
    cancelText?: string;
    icon?: 'warning' | 'error' | 'info' | 'success';
};

export function useConfirm() {
    const confirm = async ({
        title = 'Are you sure?',
        text = 'This action cannot be undone.',
        confirmText = 'Yes, proceed',
        cancelText = 'Cancel',
        icon = 'warning',
    }: ConfirmOptions = {}) => {
        const result = await Swal.fire({
            title,
            text,
            icon,
            showCancelButton: true,
            confirmButtonText: confirmText,
            cancelButtonText: cancelText,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6b7280',
            reverseButtons: true,
            focusCancel: true,
            showClass: { popup: 'swal2-show' },
            hideClass: { popup: 'swal2-hide' },
        });

        return result.isConfirmed;
    };

    return { confirm };
}
