import Swal from 'sweetalert2';

export const showToast = (icon: 'success' | 'error' | 'warning' | 'info', title: string, text?: string) => {
  let backgroundHex = '#212624'; 
  if (icon === 'success') {
    backgroundHex = '#10b981'; // Hijau solid penuh
  } else if (icon === 'error') {
    backgroundHex = '#ef4444'; // Merah solid penuh
  } else if (icon === 'warning') {
    backgroundHex = '#f59e0b'; 
  }

  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: icon,
    title: title,
    text: text,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: backgroundHex,
    color: '#ffffff',
    iconColor: '#ffffff',
    // Memaksa sudut agar sangat tumpul melengkung (rounded-3xl) dan padding lebih tipis
    customClass: {
      popup: 'shadow-2xl px-4 py-2 font-sans text-xs border-0 min-w-[260px]',
      title: 'text-white font-bold text-xs tracking-wide m-0 p-0',
      htmlContainer: 'text-white/95 font-medium text-[11px] m-0 mt-0.5 leading-tight p-0',
      timerProgressBar: 'bg-white/40 h-0.5 rounded-full mt-1.5',
      icon: 'scale-75 my-0 ml-0 mr-2',
    },
    // Menggunakan didOpen untuk menyuntikkan style CSS inline secara langsung agar dijamin melengkung tumpul
    didOpen: (toast) => {
      toast.style.borderRadius = '1.5rem'; // Sudut sangat tumpul / melengkung (equivalent rounded-3xl)
      toast.style.padding = '10px 14px';
      
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });
};