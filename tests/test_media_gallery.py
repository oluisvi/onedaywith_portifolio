import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / 'index.html').read_text(encoding='utf-8')
SCRIPT = (ROOT / 'script.js').read_text(encoding='utf-8')
MEDIA_DATA = (ROOT / 'media-data.js').read_text(encoding='utf-8') if (ROOT / 'media-data.js').exists() else ''
CSS = (ROOT / 'styles.css').read_text(encoding='utf-8') + (ROOT / 'expansion.css').read_text(encoding='utf-8')

class MediaGalleryTests(unittest.TestCase):
    def test_each_project_has_real_thumbnail(self):
        posters = (
            'assets/reel-dfdxv-poster.webp',
            'assets/project-02-preview-poster.webp',
            'assets/reel-dex09-poster.webp',
            'assets/reel-dd4cwy-poster.webp',
            'assets/reel-ddfjl-poster.webp',
            'assets/reel-ddl-poster.webp',
        )
        for poster in posters:
            self.assertIn(poster, HTML)
            self.assertTrue((ROOT / poster).exists(), poster)

    def test_each_project_exposes_behind_the_scenes_action(self):
        self.assertGreaterEqual(HTML.count('data-open-gallery='), 6)
        for project in ('project-01', 'project-02', 'project-03', 'project-04', 'project-05', 'project-06'):
            self.assertIn(f'data-open-gallery="{project}"', HTML)
        self.assertGreaterEqual(HTML.lower().count('ver prévia'), 5)
        self.assertGreaterEqual(HTML.lower().count('ver bastidores'), 1)

    def test_generic_modal_carousel_shell_exists(self):
        self.assertIn('data-media-lightbox', HTML)
        self.assertIn('data-carousel-track', HTML)
        self.assertIn('data-carousel-prev', HTML)
        self.assertIn('data-carousel-next', HTML)
        self.assertIn('data-carousel-counter', HTML)
        self.assertIn('aria-modal="true"', HTML)

    def test_project_one_media_is_mapped_separately(self):
        self.assertIn('project-01', MEDIA_DATA)
        self.assertIn('assets/reel-dfdxv.mp4', MEDIA_DATA)
        self.assertIn('assets/reel-dfdxv-poster.webp', MEDIA_DATA)
        self.assertNotIn('assets/rico-bts-video-01.mp4', MEDIA_DATA.split('project-02')[0])

    def test_project_two_contains_food_photos_and_both_videos(self):
        for asset in (
            'assets/project-02-thumbnail.webp',
            'assets/rico-bts-filming-color.webp',
            'assets/project-02-bts-02.webp',
            'assets/rico-bts-menu.webp',
            'assets/rico-bts-meat.webp',
            'assets/rico-bts-video-01.mp4',
            'assets/rico-bts-video-02.mp4',
        ):
            self.assertIn(asset, MEDIA_DATA)
            self.assertTrue((ROOT / asset).exists(), asset)

    def test_social_projects_use_public_instagram_reels(self):
        for shortcode in ('DfDxvSjTwaM', 'DeX09gjMga7', 'Dd4CWywRlkB', 'DdfJl9gu43b', 'Ddl_1S4OOSh'):
            self.assertIn(shortcode, MEDIA_DATA)
        for project in ('project-01', 'project-03', 'project-04', 'project-05', 'project-06'):
            self.assertIn(project, MEDIA_DATA)

    def test_selected_reels_use_local_video_files(self):
        for reel in ('reel-dfdxv.mp4', 'reel-dex09.mp4', 'reel-dd4cwy.mp4', 'reel-ddfjl.mp4', 'reel-ddl.mp4'):
            self.assertIn(f'assets/{reel}', MEDIA_DATA)
            self.assertTrue((ROOT / 'assets' / reel).exists(), reel)
        self.assertNotIn('data-instagram-embed', SCRIPT)
        self.assertNotIn('window.instgrm', SCRIPT)

    def test_whatsapp_links_use_the_profile_business_short_link(self):
        self.assertIn('https://wa.me/message/VWOKARGCO3MIB1', HTML)
        self.assertIn('data-whatsapp-short-link', HTML)

    def test_equipment_media_is_present_as_its_own_horizontal_rail(self):
        self.assertIn('equipment-rail', HTML)
        for asset in (
            'assets/equipment-notebook.webp',
            'assets/equipment-kit.webp',
            'assets/equipment-studio.webp',
        ):
            self.assertIn(asset, HTML)
            self.assertTrue((ROOT / asset).exists(), asset)

    def test_video_sources_are_lazy_hydrated(self):
        self.assertIn('dataset.videoSrc', SCRIPT)
        self.assertIn("video.preload = 'metadata'", SCRIPT)
        self.assertIn('removeAttribute("src")', SCRIPT)
        self.assertIn('data-preview-src=', HTML)
        self.assertIn('preload="none"', HTML)
        self.assertIn('video.dataset.previewSrc', SCRIPT)

    def test_catalog_preview_buttons_are_accessible_and_toggle_playback(self):
        self.assertIn('data-preview-toggle', HTML)
        self.assertIn('aria-pressed="false"', HTML)
        self.assertIn("button.setAttribute('aria-pressed', String(playing))", SCRIPT)
        self.assertIn('await video.play()', SCRIPT)

    def test_carousel_pauses_video_when_slide_changes_or_modal_closes(self):
        self.assertIn('.pause()', SCRIPT)
        self.assertIn('data-carousel-index', SCRIPT)
        self.assertIn('overflow = "hidden"', SCRIPT)

    def test_carousel_supports_touch_scroll_and_snap(self):
        self.assertIn('scroll-snap-type', CSS)
        self.assertIn('overflow-x: auto', CSS)
        self.assertIn('touch-action', CSS)

if __name__ == '__main__':
    unittest.main()
